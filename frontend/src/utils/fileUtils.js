// 파일 분류 및 처리 관련 유틸리티 함수들

// 이미지 파일 여부 확인
export const isImageFile = (filename) => {
  if (!filename) return false;
  return filename.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
};

// 파일 크기를 KB 단위로 변환
export const formatFileSize = (fileSize) => {
  return fileSize ? (fileSize / 1024).toFixed(1) : '0';
};

// 첨부파일을 이미지와 일반파일로 분류
export const categorizeAttachments = (attachments, deletedAttachments = []) => {
  const images = [];
  const files = [];

  attachments.forEach((file, index) => {
    if (!file || !file.originalFilename) return;

    // 삭제된 파일은 제외 (PostEdit에서만 사용)
    if (deletedAttachments.length > 0 && deletedAttachments.includes(file.postAttachmentId)) {
      return;
    }

    const isImage = isImageFile(file.originalFilename);
    const fileSize = formatFileSize(file.fileSize);

    if (isImage && file.fileUrl) {
      images.push({ ...file, fileSize, index });
    } else {
      files.push({ ...file, fileSize, index });
    }
  });

  return { images, files };
};