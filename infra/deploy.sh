#!/usr/bin/env bash
# One-command deploy: terraform provision + build + push + deploy to Cloud Run.
# Usage: ./infra/deploy.sh <project_id> [region]
#
# Prerequisites:
#   - gcloud auth login && gcloud auth configure-docker <region>-docker.pkg.dev
#   - GEMINI_API_KEY secret already created in Secret Manager, or set:
#     gcloud secrets versions add gemini-api-key --data-file=- <<< "$GEMINI_API_KEY"

set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <project_id> [region]}"
REGION="${2:-us-central1}"
REPO="${REGION}-docker.pkg.dev/${PROJECT_ID}/expertlens"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "==> Configuring Docker for Artifact Registry"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building backend image"
docker build -t "${REPO}/backend:latest" -f "${ROOT_DIR}/Dockerfile" "${ROOT_DIR}"

echo "==> Building frontend image"
docker build -t "${REPO}/frontend:latest" -f "${ROOT_DIR}/app/web/Dockerfile" "${ROOT_DIR}/app/web"

echo "==> Pushing images"
docker push "${REPO}/backend:latest"
docker push "${REPO}/frontend:latest"

echo "==> Terraform init + apply (infrastructure provisioning)"
cd "${SCRIPT_DIR}/terraform"
terraform init -input=false
terraform apply -auto-approve \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -var="backend_image=${REPO}/backend:latest" \
  -var="frontend_image=${REPO}/frontend:latest"

# Capture service URLs after first apply
BACKEND_URL=$(terraform output -raw backend_url)
FRONTEND_URL=$(terraform output -raw frontend_url)
echo "==> Backend:  ${BACKEND_URL}"
echo "==> Frontend: ${FRONTEND_URL}"

echo "==> Re-deploying with correct inter-service URLs"
# Deploy backend with real frontend URL in CORS_ORIGINS
gcloud run services update expertlens-backend \
  --region="${REGION}" \
  --update-env-vars="CORS_ORIGINS=${FRONTEND_URL}" \
  --quiet

# Deploy frontend with real backend URL
gcloud run services update expertlens-frontend \
  --region="${REGION}" \
  --update-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL}" \
  --quiet

echo ""
echo "==> Deployment complete!"
echo "    Frontend: ${FRONTEND_URL}"
echo "    Backend:  ${BACKEND_URL}"
HEALTH=$(curl -sf "${BACKEND_URL}/health") || { echo "ERROR: health check failed — service may not be reachable"; exit 1; }
echo "    Health:   ${HEALTH}"
