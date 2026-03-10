resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id  = "gemini-api-key"
  depends_on = [google_project_service.apis]

  replication {
    auto {}
  }
}

# The secret value itself is managed outside Terraform (set manually or via CI).
# To set: gcloud secrets versions add gemini-api-key --data-file=- <<< "$GEMINI_API_KEY"
