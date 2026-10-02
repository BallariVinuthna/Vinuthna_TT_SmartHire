package com.smarthire.dto.ai;

import com.smarthire.enums.AiDocumentProcessingStatus;
import com.smarthire.enums.AiDocumentType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiDocumentDto {
    private Long id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private AiDocumentType documentType;
    private AiDocumentProcessingStatus processingStatus;
    private String extractedText;
    private Integer totalChunks;
    private String statusMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
