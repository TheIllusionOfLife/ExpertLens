# Cloud Build trigger: deploy both services on every push to main.
# PREREQUISITE: Connect the GitHub repo to Cloud Build manually before applying:
#   GCP Console → Cloud Build → Triggers → Connect Repository → GitHub (Cloud Build app)
#   Select TheIllusionOfLife/ExpertLens, then run terraform apply.

data "google_project" "project" {
  project_id = var.project_id
}

locals {
  # Default Cloud Build service account
  cloudbuild_sa = "${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

resource "google_cloudbuild_trigger" "deploy_on_main" {
  name     = "deploy-on-main-push"
  project  = var.project_id
  location = var.region

  github {
    owner = "TheIllusionOfLife"
    name  = "ExpertLens"
    push {
      branch = "^main$"
    }
  }

  filename = "infra/cloudbuild.yaml"

  substitutions = {
    _BACKEND_URL  = "https://expertlens-backend-pk4kcjevqa-uc.a.run.app"
    _CORS_ORIGINS = "https://expertlens-frontend-pk4kcjevqa-uc.a.run.app,http://localhost:3000,http://localhost:3001,http://localhost:3002"
  }

  depends_on = [google_project_service.apis]
}

# IAM: grant Cloud Build SA the roles required by cloudbuild.yaml
# (build → push to Artifact Registry, deploy to Cloud Run, write logs)

resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${local.cloudbuild_sa}"
}

resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${local.cloudbuild_sa}"
}

resource "google_project_iam_member" "cloudbuild_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${local.cloudbuild_sa}"
}

resource "google_project_iam_member" "cloudbuild_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${local.cloudbuild_sa}"
}
