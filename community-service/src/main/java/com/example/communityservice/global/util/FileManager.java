package com.example.communityservice.global.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.example.communityservice.global.exception.BusinessException;
import com.example.communityservice.global.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

/** 파일 시스템 관리 유틸리티 - 파일 저장, 삭제 등 파일 관련 기본 기능 제공 */
@Slf4j
@Component
public class FileManager {

  @Value("${file.upload.path}") // 프로젝트 폴더/uploads
  private String baseUploadPath;

  @Value("${file.upload.max-size}") // 10MB
  private long maxFileSize;

  /** 허용되는 파일 확장자 목록 */
  private final List<String> allowedExtensions =
      List.of(
          "jpg", "jpeg", "png", "gif", "bmp", "pdf", "txt", "doc", "docx", "xls", "xlsx", "ppt",
          "pptx", "zip");

  /**
   * 파일을 저장하고 웹 접근 가능한 URL을 반환
   *
   * @param file 저장할 파일
   * @param subDirectory 하위 디렉토리 (예: "posts", "profiles")
   * @return 웹 접근 가능한 URL (예: /uploads/posts/2025/09/18/filename.jpg)
   */
  public String saveFile(MultipartFile file, String subDirectory) throws IOException {
    validateFile(file);

    // 날짜별 디렉토리 구조 생성 (예: uploads/posts/2024/01/15/)
    String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    String fullDirectoryPath =
        baseUploadPath + File.separator + subDirectory + File.separator + datePath;

    // 디렉토리 생성
    createDirectories(fullDirectoryPath);

    // 고유한 파일명 생성
    String originalFilename = file.getOriginalFilename();
    String uniqueFileName = generateUniqueFileName(originalFilename);
    String fullFilePath = fullDirectoryPath + File.separator + uniqueFileName;

    // 파일 저장
    Path filePath = Paths.get(fullFilePath);
    Files.write(filePath, file.getBytes());

    // 웹 접근 가능한 URL 생성 (예: /uploads/posts/2025/09/18/filename.jpg)
    String webUrl = String.format("/uploads/%s/%s/%s", subDirectory, datePath, uniqueFileName);

    log.info("파일 저장 완료: {} -> {} (URL: {})", originalFilename, fullFilePath, webUrl);

    return webUrl;
  }

  /**
   * 파일 삭제 (웹 URL을 받아서 실제 파일 경로로 변환 후 삭제)
   *
   * @param fileUrl 삭제할 파일의 웹 URL (예: /uploads/posts/2025/09/18/file.jpg)
   * @return 삭제 성공 여부
   */
  public boolean deleteFile(String fileUrl) {
    try {
      // URL을 실제 파일 경로로 변환 (예: /uploads/posts/... -> ./uploads/posts/...)
      String relativePath =
          fileUrl.startsWith("/uploads/") ? fileUrl.substring("/uploads/".length()) : fileUrl;
      String fullFilePath =
          baseUploadPath + File.separator + relativePath.replace("/", File.separator);

      Path path = Paths.get(fullFilePath);
      boolean deleted = Files.deleteIfExists(path);
      if (deleted) {
        log.info("파일 삭제 완료: {} (URL: {})", fullFilePath, fileUrl);
      } else {
        log.warn("삭제할 파일이 존재하지 않음: {} (URL: {})", fullFilePath, fileUrl);
      }
      return deleted;
    } catch (IOException e) {
      log.error("파일 삭제 실패: {}, 오류: {}", fileUrl, e.getMessage());
      return false;
    }
  }

  /** 파일 유효성 검증 */
  private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new BusinessException(ErrorCode.EMPTY_FILE);
    }

    if (file.getSize() > maxFileSize) {
      throw new BusinessException(
          ErrorCode.FILE_SIZE_EXCEEDED,
          String.format("파일 크기가 제한을 초과했습니다. (최대: %dMB)", maxFileSize / (1024 * 1024)));
    }

    String originalFilename = file.getOriginalFilename();
    if (originalFilename == null || originalFilename.trim().isEmpty()) {
      throw new BusinessException(ErrorCode.INVALID_FILENAME);
    }

    // 파일 확장자 검증
    String extension = getFileExtension(originalFilename).toLowerCase();
    if (!allowedExtensions.contains(extension)) {
      throw new BusinessException(
          ErrorCode.INVALID_FILE_TYPE,
          String.format("허용되지 않은 파일 형식입니다. 허용 형식: %s", String.join(", ", allowedExtensions)));
    }

    // 파일명에 위험한 문자가 포함되어 있는지 검증
    if (originalFilename.contains("..")
        || originalFilename.contains("/")
        || originalFilename.contains("\\")) {
      throw new BusinessException(ErrorCode.INVALID_FILENAME, "파일명에 허용되지 않은 문자가 포함되어 있습니다.");
    }
  }

  /** 디렉토리 생성 */
  private void createDirectories(String directoryPath) throws IOException {
    Path path = Paths.get(directoryPath);
    if (!Files.exists(path)) {
      Files.createDirectories(path);
      log.info("디렉토리 생성: {}", directoryPath);
    }
  }

  /** UUID와 타임스탬프를 사용한 고유 파일명 생성 */
  private String generateUniqueFileName(String originalFilename) {
    String extension = getFileExtension(originalFilename);
    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
    String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    String baseFileName = getFileNameWithoutExtension(originalFilename);

    // 원본 파일명의 길이를 제한 (너무 긴 파일명 방지)
    if (baseFileName.length() > 20) {
      baseFileName = baseFileName.substring(0, 20);
    }

    return String.format("%s_%s_%s.%s", baseFileName, timestamp, uuid, extension);
  }

  /** 파일 확장자 추출 */
  private String getFileExtension(String filename) {
    int lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
      return filename.substring(lastDotIndex + 1);
    }
    return "";
  }

  /** 확장자를 제외한 파일명 추출 */
  private String getFileNameWithoutExtension(String filename) {
    int lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return filename.substring(0, lastDotIndex);
    }
    return filename;
  }
}
