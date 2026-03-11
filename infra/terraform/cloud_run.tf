resource "google_cloud_run_v2_service" "backend" {
  name     = "expertlens-backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret.gemini_api_key,
  ]

  template {
    service_account = google_service_account.backend.email

    # 1-hour timeout so WebSocket sessions are not killed prematurely.
    # Session resumption (PR1) handles reconnects, but longer timeout reduces disruptions.
    timeout = "3600s"

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = var.backend_image

      ports {
        container_port = 8000
        name           = "http1"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "CORS_ORIGINS"
        value = var.cors_origins
      }

      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  lifecycle {
    # Image and CORS_ORIGINS are updated by the deploy script after initial provisioning.
    ignore_changes = [
      template[0].containers[0].image,
      template[0].containers[0].env,
    ]
  }
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "expertlens-frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  depends_on = [google_project_service.apis]

  template {
    service_account = google_service_account.frontend.email

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }

    containers {
      image = var.frontend_image

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
        cpu_idle = true
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = var.backend_url
      }
    }
  }

  lifecycle {
    # Image and NEXT_PUBLIC_API_URL are updated by the deploy script after initial provisioning.
    ignore_changes = [
      template[0].containers[0].image,
      template[0].containers[0].env,
    ]
  }
}
