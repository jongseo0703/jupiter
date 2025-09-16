package com.example.authservice.admin.service;

import org.springframework.data.domain.Pageable;

import com.example.authservice.global.common.PageResponse;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;

/** 관리자가 유저를 관리하기 위한 서비스임. */
public interface AdminService {

  // 모든 유저를 조회
  PageResponse<UserResponse> getAllUsers(Pageable pageable);

  // id로 유저를 조회
  UserResponse getUserById(Long id);

  // id로 유저를 업데이트
  UserResponse updateUser(Long id, UserUpdateRequest request);

  // id로 유저를 삭제
  void deleteUser(Long id);
}
