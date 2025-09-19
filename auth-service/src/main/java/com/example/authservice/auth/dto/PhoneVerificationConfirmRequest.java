package com.example.authservice.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PhoneVerificationConfirmRequest(
    @NotBlank(message = "휴대폰 번호는 필수입니다")
        @Pattern(regexp = "^01[0-9]-?[0-9]{4}-?[0-9]{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다")
        String phoneNumber,
    @NotBlank(message = "인증번호는 필수입니다") @Size(min = 6, max = 6, message = "인증번호는 6자리입니다")
        String verificationCode) {}
