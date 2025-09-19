package com.example.authservice.auth.service;

import com.example.authservice.auth.dto.ForgotPasswordRequest;
import com.example.authservice.auth.dto.ForgotPasswordResponse;
import com.example.authservice.auth.dto.LoginRequest;
import com.example.authservice.auth.dto.LoginResponse;
import com.example.authservice.auth.dto.RegisterRequest;
import com.example.authservice.user.dto.UserResponse;

public interface AuthService {

  UserResponse register(RegisterRequest request);

  LoginResponse login(LoginRequest request);

  ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);
}
