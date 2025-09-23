package com.example.authservice.admin.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record SystemStatusResponse(
    String status,
    LocalDateTime timestamp,
    SystemMetrics metrics,
    Map<String, Object> healthDetails) {

  public record SystemMetrics(
      MemoryInfo memory, long activeConnections, int threadCount, double cpuUsage, String uptime) {}

  public record MemoryInfo(
      long totalMemory, long usedMemory, long freeMemory, double usagePercentage) {}

  public static SystemStatusResponse healthy(
      SystemMetrics metrics, Map<String, Object> healthDetails) {
    return new SystemStatusResponse("UP", LocalDateTime.now(), metrics, healthDetails);
  }

  public static SystemStatusResponse unhealthy(
      SystemMetrics metrics, Map<String, Object> healthDetails) {
    return new SystemStatusResponse("DOWN", LocalDateTime.now(), metrics, healthDetails);
  }
}
