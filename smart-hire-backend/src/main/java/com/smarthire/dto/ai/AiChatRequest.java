package com.smarthire.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatRequest {
    @NotBlank(message = "Message is required")
    private String message;
    private Long conversationId;
    private Long documentId;
}
