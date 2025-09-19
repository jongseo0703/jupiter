package com.example.communityservice.dto.posts;

import com.example.communityservice.entity.PostAttachments;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 첨부파일 응답용 DTO - 첨부파일 정보를 클라이언트에게 전송할 때 사용 */
@Schema(description = "첨부파일 조회 응답 DTO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostAttachmentsResponseDTO {

  @Schema(description = "첨부파일 ID", example = "1")
  private Long postAttachmentId;

  @Schema(description = "원본 파일명", example = "전통주_사진.jpg")
  private String originalFilename;

  @Schema(description = "저장된 파일명", example = "20240115_103000_abc123.jpg")
  private String fileName;

  @Schema(
      description = "파일 웹 접근 URL",
      example = "/uploads/posts/2025/09/18/20240115_103000_abc123.jpg")
  private String fileUrl;

  @Schema(description = "파일 크기 (바이트)", example = "1048576")
  private Long fileSize;

  @Schema(description = "포맷된 파일 크기", example = "1.0 MB")
  private String formattedFileSize;

  /**
   * PostAttachments 엔티티를 PostAttachmentsResponseDTO로 변환하는 정적 팩토리 메서드
   *
   * @param attachment 변환할 PostAttachments 엔티티
   * @return PostAttachmentsResponseDTO 객체
   */
  public static PostAttachmentsResponseDTO from(PostAttachments attachment) {
    return PostAttachmentsResponseDTO.builder()
        .postAttachmentId(attachment.getPostAttachmentId())
        .originalFilename(attachment.getOriginalFilename())
        .fileName(attachment.getFileName())
        .fileUrl(attachment.getFileUrl())
        .fileSize(attachment.getFileSize())
        .formattedFileSize(attachment.getFormattedFileSize())
        .build();
  }
}
