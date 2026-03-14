# Cloud Build trigger: deploy both services on every push to main.
# PREREQUISITE: Connect the GitHub repo to Cloud Build manually before applying:
#   GCP Console → Cloud Build → Triggers → Connect Repository → GitHub (Cloud Build app)
#   Select TheIllusionOfLife/ExpertLens, then run terraform apply.
#
# NOTE: If org policy requires a user-managed SA, create the trigger via the Console
# and import it: terraform import google_cloudbuild_trigger.deploy_on_main <TRIGGER_ID>

resource "google_service_account" "cloudbuild" {
  account_id   = "expertlens-cloudbuild"
  display_name = "ExpertLens Cloud Build"
  depends_on   = [google_project_service.apis]
}

resource "google_cloudbuild_trigger" "deploy_on_main" {
  name            = "deploy-on-main-push"
  project         = var.project_id
  service_account = google_service_account.cloudbuild.id
  # 1st-gen GitHub App connections are global — no location field.

  github {
    owner = "TheIllusionOfLife"
    name  = "ExpertLens"
    push {
      branch = "^main$"
    }
  }

  filename = "infra/cloudbuild.yaml"

  substitutions = {
    _BACKEND_URL = google_cloud_run_v2_service.backend.uri
    # Frontend URL + localhost origins for local dev. Uses ^#^ delimiter in set-cors step
    # so commas in the value are not misinterpreted as key=value separators by gcloud.
    _CORS_ORIGINS = "${google_cloud_run_v2_service.frontend.uri},http://localhost:3000,http://localhost:3001,http://localhost:3002"
  }

  depends_on = [google_project_service.apis]
}

# IAM: grant Cloud Build SA the minimum roles required by cloudbuild.yaml
# (deploy to Cloud Run, push to Artifact Registry, write logs)

resource "google_project_iam_member" "cloudbuild_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

resource "google_project_iam_member" "cloudbuild_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

resource "google_project_iam_member" "cloudbuild_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild.email}"
}

# Scope iam.serviceAccountUser to only the runtime SAs Cloud Run uses (least privilege).
resource "google_service_account_iam_member" "cloudbuild_sa_user_backend" {
  service_account_id = google_service_account.backend.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudbuild.email}"
}

resource "google_service_account_iam_member" "cloudbuild_sa_user_frontend" {
  service_account_id = google_service_account.frontend.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudbuild.email}"
}
