resource "google_service_account" "backend" {
  account_id   = "expertlens-backend"
  display_name = "ExpertLens Backend Service Account"
  depends_on   = [google_project_service.apis]
}

resource "google_service_account" "frontend" {
  account_id   = "expertlens-frontend"
  display_name = "ExpertLens Frontend Service Account"
  depends_on   = [google_project_service.apis]
  # No GCP permissions needed — acts as a low-privilege identity for the public frontend service.
}

# Firestore access
resource "google_project_iam_member" "backend_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# Secret Manager access — scoped to individual secrets, not project-wide
resource "google_secret_manager_secret_iam_member" "backend_gemini_key_accessor" {
  secret_id = google_secret_manager_secret.gemini_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_jwt_secret_accessor" {
  secret_id = google_secret_manager_secret.jwt_secret_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend.email}"
}

# Cloud Storage read access — scoped to the assets bucket, not project-wide
resource "google_storage_bucket_iam_member" "backend_storage_viewer" {
  bucket = google_storage_bucket.assets.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.backend.email}"
}

# Allow unauthenticated access to Cloud Run services (public demo)
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
