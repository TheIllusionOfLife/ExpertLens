resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id  = "gemini-api-key"
  depends_on = [google_project_service.apis]

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "jwt_secret_key" {
  secret_id  = "jwt-secret-key"
  depends_on = [google_project_service.apis]

  replication {
    auto {}
  }
}

# The secret values themselves are managed outside Terraform (set manually or via CI).
# To set: gcloud secrets versions add gemini-api-key --data-file=- <<< "$GEMINI_API_KEY"
# To set: gcloud secrets versions add jwt-secret-key --data-file=- <<< "$(openssl rand -base64 48)"
