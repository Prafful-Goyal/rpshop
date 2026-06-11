#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PROJECT_ID:-}" ]]; then
  echo "Set PROJECT_ID before running this script."
  exit 1
fi

if [[ -z "${REGION:-}" ]]; then
  REGION="asia-south1"
fi

SERVICE_NAME="tshirt-store"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

gcloud config set project "${PROJECT_ID}"
gcloud builds submit --tag "${IMAGE}" .
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080
