export const REVIEW_FILES: readonly string[];
export function createReviewPack(options?: {
  projectRoot?: string;
  outputRoot?: string;
  archive?: boolean;
}): {
  directory: string;
  archive: string | null;
  archive_sha256: string | null;
  release_status: string;
};
export function verifyReviewPack(directory: string): {
  status: string;
  files: number;
  release_status: string;
};
