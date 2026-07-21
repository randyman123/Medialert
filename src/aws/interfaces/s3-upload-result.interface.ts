export interface S3UploadResult {
  bucket: string;
  key: string;
  contentType: string;
  size: number;
  etag?: string;
}
