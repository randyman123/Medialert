#!/bin/sh
set -eu

BUCKET_NAME="medialert-archivos-clinicos"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

log() {
  echo "[localstack-init] $1"
}

if command -v awslocal >/dev/null 2>&1; then
  AWS_CMD="awslocal"
else
  log "awslocal no está disponible dentro del contenedor"
  exit 1
fi

log "Inicializando bucket S3 demo en región ${AWS_REGION}"

if ${AWS_CMD} s3api head-bucket --bucket "${BUCKET_NAME}" >/dev/null 2>&1; then
  log "El bucket ${BUCKET_NAME} ya existe. No se crea nuevamente."
else
  log "Creando bucket ${BUCKET_NAME}"
  ${AWS_CMD} s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}"
  log "Bucket ${BUCKET_NAME} creado correctamente"
fi

log "Buckets disponibles actualmente:"
${AWS_CMD} s3 ls
