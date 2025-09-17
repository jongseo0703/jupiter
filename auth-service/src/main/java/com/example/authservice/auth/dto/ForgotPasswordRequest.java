package com.example.authservice.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "이메일은 필수입니다") @Email(message = "올바른 이메일 형식이 아닙니다") String email) {}
