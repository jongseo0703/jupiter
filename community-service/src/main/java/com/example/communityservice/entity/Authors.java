package com.example.communityservice.entity;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(
    name = "authors",
    indexes = {
      @Index(name = "idx_user_id", columnList = "user_id"), // 회원별 작성 내역 조회
      @Index(name = "idx_anonymous_email", columnList = "anonymous_email") // 익명 사용자 인증
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Authors {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "author_id")
  private Long authorId;

  @Column(name = "user_id")
  private Long userId; // User Service 참조값 (회원일 때만)

  @Column(name = "author_name", length = 100)
  private String authorName; // 작성자명 (회원명 또는 익명닉네임, null일 때 '익명')

  @Column(name = "is_anonymous", nullable = false)
  @Builder.Default
  private Boolean isAnonymous = false; // 익명 여부

  @Column(name = "anonymous_email", nullable = true)
  private String anonymousEmail; // 익명 사용자 이메일 (익명 선택 시에만)

  @Column(name = "anonymous_pwd", nullable = true)
  private String anonymousPwd; // 익명 사용자 비밀번호 (익명 선택 시에만, 암호화)

  // 생성자 메서드들
  public static Authors createMemberAuthor(Long userId, String authorName) {
    return Authors.builder().userId(userId).authorName(authorName).isAnonymous(false).build();
  }

  public static Authors createAnonymousAuthor(
      String authorName, String email, String encodedPassword) {
    return Authors.builder()
        .authorName(authorName)
        .isAnonymous(true)
        .anonymousEmail(email)
        .anonymousPwd(encodedPassword)
        .build();
  }

  // 표시용 작성자명 반환 (null일 때 '익명' 반환)
  public String getDisplayAuthorName() {
    return authorName != null ? authorName : "익명";
  }

  // 유효성 검증
  public boolean isValidAuthor() {
    if (!isAnonymous) {
      return userId != null && anonymousEmail == null && anonymousPwd == null;
    } else {
      return userId == null && anonymousEmail != null && anonymousPwd != null;
    }
  }
}
