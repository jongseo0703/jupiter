package com.example.authservice.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TwoFactorVerifyRequest(
    @NotBlank(message = "임시 토큰이 필요합니다") String tempToken,
    @NotBlank(message = "인증 코드가 필요합니다")
        @Pattern(regexp = "^[0-9]{6}$", message = "인증 코드는 6자리 숫자여야 합니다")
        String code) {}
