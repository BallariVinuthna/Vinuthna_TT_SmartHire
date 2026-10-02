package com.smarthire.dto.ai;

import com.smarthire.enums.MessageRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMessageDto {
    private Long id;
    private MessageRole role;
    private String content;
    private LocalDateTime createdAt;
}
