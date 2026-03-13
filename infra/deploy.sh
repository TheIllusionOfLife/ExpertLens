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

echo "==> Terraform init + apply (creates Artifact Registry before image push)"
cd "${SCRIPT_DIR}/terraform"
terraform init -input=false
# Use placeholder images so Cloud Run services can be provisioned before images are pushed.
# Real images are deployed in the gcloud run services update step below.
terraform apply -auto-approve \
  -var="project_id=${PROJECT_ID}" \
  -var="region=${REGION}" \
  -var="backend_image=gcr.io/cloudrun/placeholder:latest" \
  -var="frontend_image=gcr.io/cloudrun/placeholder:latest"

# Capture service URLs — known after Terraform provisions the services
BACKEND_URL=$(terraform output -raw backend_url)
FRONTEND_URL=$(terraform output -raw frontend_url)
echo "==> Backend:  ${BACKEND_URL}"
echo "==> Frontend: ${FRONTEND_URL}"

echo "==> Configuring Docker for Artifact Registry"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building backend image"
docker build --platform linux/amd64 -t "${REPO}/backend:latest" -f "${ROOT_DIR}/Dockerfile" "${ROOT_DIR}"

echo "==> Building frontend image (baking backend URL at build time)"
# NEXT_PUBLIC_* vars must be set at build time — they are inlined into the JS bundle.
# Setting them via Cloud Run env vars post-build has no effect for client-side code.
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="${BACKEND_URL}" \
  -t "${REPO}/frontend:latest" \
  -f "${ROOT_DIR}/app/web/Dockerfile" \
  "${ROOT_DIR}/app/web"

echo "==> Pushing images"
docker push "${REPO}/backend:latest"
docker push "${REPO}/frontend:latest"

echo "==> Re-deploying with correct images and inter-service URLs"
# Deploy backend with real image + frontend URL in CORS_ORIGINS
gcloud run services update expertlens-backend \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${REPO}/backend:latest" \
  --update-env-vars="CORS_ORIGINS=${FRONTEND_URL}" \
  --quiet

# Deploy frontend with real image (NEXT_PUBLIC_API_URL already baked into the image)
gcloud run services update expertlens-frontend \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${REPO}/frontend:latest" \
  --quiet

echo ""
echo "==> Deployment complete!"
echo "    Frontend: ${FRONTEND_URL}"
echo "    Backend:  ${BACKEND_URL}"
HEALTH=$(curl -sf "${BACKEND_URL}/health") || { echo "ERROR: health check failed — service may not be reachable"; exit 1; }
echo "    Health:   ${HEALTH}"
