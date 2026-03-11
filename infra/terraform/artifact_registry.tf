resource "google_artifact_registry_repository" "expertlens" {
  repository_id = "expertlens"
  format        = "DOCKER"
  location      = var.region
  description   = "ExpertLens container images"
  depends_on    = [google_project_service.apis]
}
