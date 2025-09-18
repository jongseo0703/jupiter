package com.example.communityservice.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.communityservice.dto.posts.PostAttachmentsResponseDTO;
import com.example.communityservice.entity.PostAttachments;
import com.example.communityservice.entity.Posts;
import com.example.communityservice.global.exception.BusinessException;
import com.example.communityservice.global.exception.ErrorCode;
import com.example.communityservice.global.util.FileManager;
import com.example.communityservice.repository.PostAttachmentsRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 파일 업로드 관련 서비스 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

  private final PostAttachmentsRepository postAttachmentsRepository;
  private final FileManager fileManager;

  /**
   * 여러 파일을 업로드하고 게시글에 연결
   *
   * @param files 업로드할 파일들
   * @param post 연결할 게시글
   * @return 업로드된 첨부파일 목록
   */
  public List<PostAttachmentsResponseDTO> uploadFiles(List<MultipartFile> files, Posts post) {
    List<PostAttachmentsResponseDTO> attachments = new ArrayList<>();

    for (MultipartFile file : files) {
      if (!file.isEmpty()) {
        try {
          PostAttachmentsResponseDTO attachment = uploadSingleFile(file, post);
          attachments.add(attachment);
        } catch (Exception e) {
          log.error("파일 업로드 실패: {}, 오류: {}", file.getOriginalFilename(), e.getMessage());
          throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED, "파일 업로드에 실패했습니다: " + file.getOriginalFilename());
        }
      }
    }

    return attachments;
  }

  /**
   * 단일 파일 업로드
   *
   * @param file 업로드할 파일
   * @param post 연결할 게시글
   * @return 업로드된 첨부파일 정보
   */
  private PostAttachmentsResponseDTO uploadSingleFile(MultipartFile file, Posts post)
      throws IOException {
    // FileManager를 사용하여 파일 저장
    FileManager.SavedFileInfo savedFileInfo = fileManager.saveFile(file, "posts");

    // 데이터베이스에 파일 정보 저장
    PostAttachments attachment =
        PostAttachments.create(
            post,
            savedFileInfo.getOriginalFilename(),
            savedFileInfo.getSavedFileName(),
            savedFileInfo.getFullPath(),
            savedFileInfo.getFileSize());
    PostAttachments savedAttachment = postAttachmentsRepository.save(attachment);

    log.info(
        "파일 업로드 완료: {} -> {}",
        savedFileInfo.getOriginalFilename(),
        savedFileInfo.getSavedFileName());
    return PostAttachmentsResponseDTO.from(savedAttachment);
  }

  /**
   * 게시글의 첨부파일 목록 조회
   *
   * @param postId 게시글 ID
   * @return 첨부파일 목록
   */
  public List<PostAttachmentsResponseDTO> getAttachmentsByPostId(Long postId) {
    List<PostAttachments> attachments =
        postAttachmentsRepository.findByPostIdOrderByCreatedAt(postId);
    return attachments.stream().map(PostAttachmentsResponseDTO::from).toList();
  }

  /**
   * 첨부파일 삭제
   *
   * @param attachmentId 첨부파일 ID
   */
  public void deleteAttachment(Long attachmentId) {
    PostAttachments attachment =
        postAttachmentsRepository
            .findById(attachmentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ATTACHMENT_NOT_FOUND));

    // FileManager를 사용하여 실제 파일 삭제
    boolean deleted = fileManager.deleteFile(attachment.getFilePath());
    if (!deleted) {
      log.warn("실제 파일 삭제 실패: {}", attachment.getFilePath());
    }

    // 데이터베이스에서 삭제
    postAttachmentsRepository.delete(attachment);
    log.info("첨부파일 삭제 완료: {}", attachment.getOriginalFilename());
  }
}
