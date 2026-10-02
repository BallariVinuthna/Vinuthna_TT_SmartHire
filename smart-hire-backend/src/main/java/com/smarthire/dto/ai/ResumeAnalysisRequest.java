package com.smarthire.dto.ai;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisRequest {
    private Long documentId;
    private String rawText;
}
