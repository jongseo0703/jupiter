package com.example.communityservice.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_attachments")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostAttachments {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "post_attachment_id")
  private Long postAttachmentId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "post_id", nullable = false)
  private Posts post;

  @Column(name = "original_filename", nullable = false)
  private String originalFilename;

  @Column(name = "file_name", nullable = false)
  private String fileName;

  @Column(name = "file_url", nullable = false, length = 500)
  private String fileUrl;

  @Column(name = "file_size", nullable = false)
  private Long fileSize;

  // 생성자 메서드
  public static PostAttachments create(
      Posts post, String originalFilename, String fileName, String fileUrl, Long fileSize) {
    return PostAttachments.builder()
        .post(post)
        .originalFilename(originalFilename)
        .fileName(fileName)
        .fileUrl(fileUrl)
        .fileSize(fileSize)
        .build();
  }

  // 파일 크기를 KB 단위로 반환 (더 일반적)
  public double getFileSizeInKB() {
    return fileSize / 1024.0;
  }

  // 파일 크기를 MB 단위로 반환 (큰 파일용)
  public double getFileSizeInMB() {
    return fileSize / (1024.0 * 1024.0);
  }

  // 적절한 단위로 포맷된 파일 크기 반환
  public String getFormattedFileSize() {
    if (fileSize < 1024) { // 1KB 미만
      return fileSize + " B";
    } else if (fileSize < 1024 * 1024) { // 1MB 미만
      return String.format("%.1f KB", getFileSizeInKB());
    } else { // 1MB 이상
      return String.format("%.1f MB", getFileSizeInMB());
    }
  }
}
