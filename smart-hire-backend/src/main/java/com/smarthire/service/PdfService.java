package com.smarthire.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class PdfService {

    public record PdfExtractionResult(String text, int pageCount, boolean isScannedOrEmpty, String warningMessage) {}

    public PdfExtractionResult extractTextWithMetadata(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String originalFileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        // Non-PDF text fallback (txt, md, csv)
        if (!originalFileName.endsWith(".pdf")) {
            String text = new String(file.getBytes(), StandardCharsets.UTF_8).trim();
            return new PdfExtractionResult(text, 1, text.isEmpty(), text.isEmpty() ? "File content is empty." : null);
        }

        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            int numberOfPages = document.getNumberOfPages();
            if (numberOfPages == 0) {
                return new PdfExtractionResult("", 0, true, "PDF has 0 pages.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String rawText = stripper.getText(document);
            String cleanText = (rawText == null) ? "" : rawText.trim();

            // Detect scanned PDFs: multiple pages but virtually no selectable text
            boolean likelyScanned = cleanText.length() < (numberOfPages * 25);
            String warning = null;
            if (cleanText.isEmpty()) {
                warning = "No extractable text found. Document appears to be a scanned image or empty (OCR required).";
            } else if (likelyScanned && numberOfPages > 1) {
                warning = "Low text density detected (" + cleanText.length() + " chars across " + numberOfPages + " pages). Document might be partially scanned.";
            }

            log.info("PDF extraction completed for [{}]: {} pages, {} characters extracted",
                    file.getOriginalFilename(), numberOfPages, cleanText.length());

            return new PdfExtractionResult(cleanText, numberOfPages, cleanText.isEmpty(), warning);
        }
    }

    public String extractText(MultipartFile file) throws IOException {
        return extractTextWithMetadata(file).text();
    }
}
