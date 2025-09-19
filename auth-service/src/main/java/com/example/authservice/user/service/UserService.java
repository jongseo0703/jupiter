package com.example.authservice.user.service;

import com.example.authservice.user.dto.PasswordChangeRequest;
import com.example.authservice.user.dto.UserResponse;
import com.example.authservice.user.dto.UserUpdateRequest;
import com.example.authservice.user.entity.User;

/** 유저 로직을 처리하는 UserService임. */
public interface UserService {

  // id로 유저를 가져옴.
  UserResponse getUserById(Long id);

  // 현재 유저의 userId로 갱신 요청을 처리함.
  UserResponse updateCurrentUser(Long userId, UserUpdateRequest request);

  // 현재 유저의 userId로 삭제 요청을 처리함.
  void deleteCurrentUser(Long userId);

  // 이메일로 유저를 가져옴.
  UserResponse getUserByEmail(String email);

  // 이메일로 유저 엔터티를 가져옴 (내부 사용용).
  User findUserByEmail(String email);

  // 현재 인증된 사용자를 가져옴.
  User getCurrentUser();

  // 현재 사용자의 비밀번호를 변경함.
  UserResponse changePassword(Long userId, PasswordChangeRequest request);
}
