package com.smarthire.dto.ai;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeMatchRequest {
    private Long resumeDocumentId;
    private Long jobDescriptionDocumentId;
    private Long jobId;
    private String customJobDescription;
}
