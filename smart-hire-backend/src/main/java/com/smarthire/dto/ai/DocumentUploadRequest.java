package com.smarthire.dto.ai;

import com.smarthire.enums.AiDocumentType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentUploadRequest {
    private AiDocumentType documentType;
}
