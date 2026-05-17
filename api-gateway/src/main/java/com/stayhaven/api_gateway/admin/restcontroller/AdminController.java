package com.stayhaven.api_gateway.admin.restcontroller;

import com.stayhaven.api_gateway.admin.dto.AdminSummaryDto;
import com.stayhaven.api_gateway.common.ApiResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @GetMapping("/summary")
    public ResponseEntity<@NonNull ApiResponse<AdminSummaryDto>> getSummary() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.fail("Admin summary is not implemented yet."));
    }
}
