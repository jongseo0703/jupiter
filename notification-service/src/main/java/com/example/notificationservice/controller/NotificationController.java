package com.example.notificationservice.controller;

import com.example.notificationservice.dto.PriceChangeRequest;
import com.example.notificationservice.service.PriceAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final PriceAlertService priceAlertService;

    @PostMapping("/price-change")
    public ResponseEntity<String> notifyPriceChange(@RequestBody PriceChangeRequest request) {
        priceAlertService.processPriceChange(request);
        return ResponseEntity.ok("가격 변동 알림이 처리되었습니다.");
    }
}
