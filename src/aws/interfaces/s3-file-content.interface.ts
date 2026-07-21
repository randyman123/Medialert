export interface S3FileContent {
  key: string;
  contentType: string;
  contentLength: number;
  lastModified?: string;
  etag?: string;
  body: Buffer;
}
