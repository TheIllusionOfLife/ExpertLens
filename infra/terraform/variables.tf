variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  type        = string
  default     = "us-central1"
}

variable "backend_image" {
  description = "Full Artifact Registry image path for the backend service"
  type        = string
  # e.g. us-central1-docker.pkg.dev/<project>/expertlens/backend:latest
}

variable "frontend_image" {
  description = "Full Artifact Registry image path for the frontend service"
  type        = string
  # e.g. us-central1-docker.pkg.dev/<project>/expertlens/frontend:latest
}

variable "backend_url" {
  description = "Backend Cloud Run service URL (set after first deploy)"
  type        = string
  default     = "https://placeholder.example.com"
}

variable "cors_origins" {
  description = "Comma-separated allowed CORS origins for the backend"
  type        = string
  default     = "http://localhost:3000"
}
