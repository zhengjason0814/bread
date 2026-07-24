const { randomUUID } = require('crypto')
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const s3 = require('../config/s3')

const BUCKET = process.env.S3_BUCKET
const VIEW_URL_TTL_SECONDS = 300

const EXTENSION_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

const ACCEPTED_TYPES = Object.keys(EXTENSION_BY_TYPE)

function buildKey(userId, expenseId, contentType) {
  const ext = EXTENSION_BY_TYPE[contentType]
  return `receipts/${userId}/${expenseId}/${randomUUID()}.${ext}`
}

async function putReceipt(buffer, key, contentType) {
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
  )
}

async function getPresignedViewUrl(key) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: VIEW_URL_TTL_SECONDS,
  })
}

async function deleteReceipt(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

module.exports = {
  buildKey,
  putReceipt,
  getPresignedViewUrl,
  deleteReceipt,
  EXTENSION_BY_TYPE,
  ACCEPTED_TYPES,
}
