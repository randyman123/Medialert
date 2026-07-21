export interface S3FileSummary {
  key: string;
  size: number;
  lastModified?: string;
  etag?: string;
}
