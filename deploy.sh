#!/bin/bash

# Build e deploy para o Cloud Run
gcloud run deploy segtrack123 \
  --source . \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="PORT=8080" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="DATABASE_URL=${DATABASE_URL}" \
  --set-env-vars="JWT_SECRET=${JWT_SECRET}" \
  --set-env-vars="BASE_URL=https://segtrack123-459783979706.southamerica-east1.run.app" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --port 8080 \
  --timeout 300 \
  --set-cloudsql-instances="${CLOUD_SQL_CONNECTION_NAME}" \
  --labels="env=prod,runtime=nodejs" \
  --service-account="${SERVICE_ACCOUNT}" \
  --execution-environment=gen2 \
  --ingress=all \
  --vpc-connector="${VPC_CONNECTOR}" \
  --vpc-egress=all-traffic \
  --session-affinity 