package com.example.authservice.admin.service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.authservice.admin.dto.SystemStatusResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemMonitoringService {

  private final Optional<HealthEndpoint> healthEndpoint;
  private final RedisTemplate<String, Object> redisTemplate;
  private final Instant startTime = Instant.now();

  public SystemStatusResponse getSystemStatus() {
    try {
      // 시스템 메트릭스 수집
      SystemStatusResponse.SystemMetrics metrics = collectSystemMetrics();

      // Health 정보 수집 (있는 경우에만)
      Map<String, Object> healthDetails = new HashMap<>();
      String status = "UP"; // 기본값

      if (healthEndpoint.isPresent()) {
        try {
          HealthComponent healthComponent = healthEndpoint.get().health();
          if (healthComponent instanceof Health) {
            Health health = (Health) healthComponent;
            healthDetails = health.getDetails();
            status = health.getStatus().getCode();
          } else {
            healthDetails.put("health_type", healthComponent.getClass().getSimpleName());
            status = "UP"; // 기본값 유지
          }
        } catch (Exception e) {
          log.warn("HealthEndpoint 호출 실패", e);
          healthDetails.put("health_error", e.getMessage());
          status = "DOWN";
        }
      } else {
        // HealthEndpoint가 없는 경우 기본 헬스체크
        healthDetails.put("note", "HealthEndpoint를 사용할 수 없습니다");
        healthDetails.put("basic_check", "시스템이 응답 중");
      }

      if ("UP".equals(status)) {
        return SystemStatusResponse.healthy(metrics, healthDetails);
      } else {
        return SystemStatusResponse.unhealthy(metrics, healthDetails);
      }

    } catch (Exception e) {
      log.error("시스템 상태 조회 중 오류 발생", e);
      return SystemStatusResponse.unhealthy(
          collectSystemMetrics(), Map.of("error", e.getMessage()));
    }
  }

  private SystemStatusResponse.SystemMetrics collectSystemMetrics() {
    // 메모리 정보 수집
    MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    long totalMemory = memoryBean.getHeapMemoryUsage().getMax();
    long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
    long freeMemory = totalMemory - usedMemory;
    double usagePercentage = (double) usedMemory / totalMemory * 100;

    SystemStatusResponse.MemoryInfo memoryInfo =
        new SystemStatusResponse.MemoryInfo(totalMemory, usedMemory, freeMemory, usagePercentage);

    // 스레드 정보
    ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
    int threadCount = threadBean.getThreadCount();

    // Redis 연결 수 (활성 연결로 근사치 사용)
    long activeConnections = getActiveRedisConnections();

    // CPU 사용률 (간단한 버전)
    double cpuUsage = getCpuUsage();

    // 업타임
    String uptime = formatUptime(Duration.between(startTime, Instant.now()));

    return new SystemStatusResponse.SystemMetrics(
        memoryInfo, activeConnections, threadCount, cpuUsage, uptime);
  }

  private long getActiveRedisConnections() {
    try {
      // Redis INFO 명령어를 사용하여 연결 수 확인
      return 1; // 기본값, 실제로는 Redis 모니터링 구현 필요
    } catch (Exception e) {
      log.warn("Redis 연결 수 확인 실패", e);
      return 0;
    }
  }

  private double getCpuUsage() {
    try {
      com.sun.management.OperatingSystemMXBean osBean =
          (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
      return osBean.getCpuLoad() * 100;
    } catch (Exception e) {
      log.warn("CPU 사용률 확인 실패", e);
      return 0.0;
    }
  }

  private String formatUptime(Duration uptime) {
    long days = uptime.toDays();
    long hours = uptime.toHoursPart();
    long minutes = uptime.toMinutesPart();
    long seconds = uptime.toSecondsPart();

    if (days > 0) {
      return String.format("%d일 %d시간 %d분", days, hours, minutes);
    } else if (hours > 0) {
      return String.format("%d시간 %d분", hours, minutes);
    } else if (minutes > 0) {
      return String.format("%d분 %d초", minutes, seconds);
    } else {
      return String.format("%d초", seconds);
    }
  }

  public Map<String, Object> getDetailedMetrics() {
    Map<String, Object> metrics = new HashMap<>();

    try {
      // JVM 메트릭스
      MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
      metrics.put("heap_memory", memoryBean.getHeapMemoryUsage());
      metrics.put("non_heap_memory", memoryBean.getNonHeapMemoryUsage());

      // 스레드 메트릭스
      ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
      metrics.put("thread_count", threadBean.getThreadCount());
      metrics.put("peak_thread_count", threadBean.getPeakThreadCount());
      metrics.put("daemon_thread_count", threadBean.getDaemonThreadCount());

      // 운영체제 메트릭스
      var osBean = ManagementFactory.getOperatingSystemMXBean();
      metrics.put("available_processors", osBean.getAvailableProcessors());
      metrics.put("system_load_average", osBean.getSystemLoadAverage());

      // 업타임
      metrics.put("uptime", formatUptime(Duration.between(startTime, Instant.now())));

    } catch (Exception e) {
      log.error("상세 메트릭스 수집 중 오류 발생", e);
      metrics.put("error", e.getMessage());
    }

    return metrics;
  }
}
