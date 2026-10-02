package com.smarthire.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class TextChunkService {

    private static final int DEFAULT_CHUNK_SIZE = 750;
    private static final int DEFAULT_OVERLAP = 120;

    public record Chunk(int index, String content, int startChar, int endChar) {}

    public List<Chunk> splitIntoChunks(String text) {
        return splitIntoChunks(text, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP);
    }

    public List<Chunk> splitIntoChunks(String text, int chunkSize, int overlap) {
        List<Chunk> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        String normalized = text.replaceAll("\\r\\n", "\n").replaceAll("[ \\t]+", " ").trim();
        if (normalized.length() <= chunkSize) {
            chunks.add(new Chunk(0, normalized, 0, normalized.length()));
            return chunks;
        }

        int start = 0;
        int index = 0;
        int textLength = normalized.length();

        while (start < textLength) {
            int end = Math.min(start + chunkSize, textLength);

            // If not at the end of the text, try to break at a sentence or newline boundary
            if (end < textLength) {
                int breakPoint = -1;
                // Look for paragraph break
                int lastNewline = normalized.lastIndexOf("\n\n", end);
                if (lastNewline > start + (chunkSize / 2)) {
                    breakPoint = lastNewline + 2;
                } else {
                    // Look for sentence end
                    int lastPeriod = normalized.lastIndexOf(". ", end);
                    if (lastPeriod > start + (chunkSize / 2)) {
                        breakPoint = lastPeriod + 2;
                    } else {
                        // Look for space
                        int lastSpace = normalized.lastIndexOf(" ", end);
                        if (lastSpace > start + (chunkSize / 3)) {
                            breakPoint = lastSpace + 1;
                        }
                    }
                }
                if (breakPoint > start) {
                    end = breakPoint;
                }
            }

            String chunkContent = normalized.substring(start, end).trim();
            if (!chunkContent.isEmpty()) {
                chunks.add(new Chunk(index++, chunkContent, start, end));
            }

            if (end >= textLength) {
                break;
            }

            // Move forward with overlap
            start = Math.max(start + 1, end - overlap);
        }

        log.debug("Split text of length {} into {} chunks (size: {}, overlap: {})",
                textLength, chunks.size(), chunkSize, overlap);
        return chunks;
    }
}
