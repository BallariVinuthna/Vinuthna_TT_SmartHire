package com.smarthire.controller;

import com.smarthire.dto.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("service", "SmartHire Recruitment Platform API");
        status.put("status", "UP");
        status.put("version", "1.0.0");
        status.put("port", 8080);
        status.put("frontendUrl", "http://localhost:5173");
        return ResponseEntity.ok(ApiResponse.success("SmartHire Backend API is running healthy", status));
    }
}
