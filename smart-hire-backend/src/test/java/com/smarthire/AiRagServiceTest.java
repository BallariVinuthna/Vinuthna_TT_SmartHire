package com.smarthire;

import com.smarthire.dto.ai.*;
import com.smarthire.entity.*;
import com.smarthire.enums.AiDocumentProcessingStatus;
import com.smarthire.enums.AiDocumentType;
import com.smarthire.enums.Role;
import com.smarthire.repository.*;
import com.smarthire.service.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiRagServiceTest {

    private PdfService pdfService;
    private TextChunkService textChunkService;
    private GeminiService geminiService;

    @Mock
    private AiDocumentRepository aiDocumentRepository;
    @Mock
    private AiDocumentChunkRepository aiDocumentChunkRepository;
    @Mock
    private AiConversationRepository aiConversationRepository;
    @Mock
    private AiMessageRepository aiMessageRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private VectorStoreService vectorStoreService;

    private AiService aiService;
    private User testRecruiter;

    @BeforeEach
    void setUp() {
        pdfService = new PdfService();
        textChunkService = new TextChunkService();
        geminiService = new GeminiService();

        aiService = new AiService(
                aiDocumentRepository,
                aiDocumentChunkRepository,
                aiConversationRepository,
                aiMessageRepository,
                jobRepository,
                pdfService,
                textChunkService,
                geminiService,
                vectorStoreService
        );

        testRecruiter = User.builder()
                .id(2L)
                .email("rachel.recruiter@smarthire.com")
                .name("Rachel Green")
                .role(Role.ROLE_RECRUITER)
                .build();
    }

    @Test
    @DisplayName("PDF Text Extraction with PDFBox should extract readable text")
    void testPdfTextExtraction() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 12);
                content.newLineAtOffset(100, 700);
                content.showText("Alex Johnson - Senior Full Stack Java and React Developer with 5 years experience.");
                content.endText();
            }
            doc.save(out);
        }

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "alex_resume.pdf",
                "application/pdf",
                out.toByteArray()
        );

        PdfService.PdfExtractionResult result = pdfService.extractTextWithMetadata(file);
        assertNotNull(result);
        assertEquals(1, result.pageCount());
        assertFalse(result.isScannedOrEmpty());
        assertTrue(result.text().contains("Alex Johnson"));
        assertTrue(result.text().contains("Java and React Developer"));
    }

    @Test
    @DisplayName("Text Chunking should create overlapping chunks preserving boundaries")
    void testTextChunking() {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 20; i++) {
            sb.append("Section ").append(i).append(": Demonstrated mastery in building resilient Spring Boot REST microservices and deploying with Docker and Kubernetes. ");
        }
        String fullText = sb.toString();

        List<TextChunkService.Chunk> chunks = textChunkService.splitIntoChunks(fullText, 400, 80);
        assertNotNull(chunks);
        assertTrue(chunks.size() >= 2, "Text should be split into multiple chunks");

        for (int i = 0; i < chunks.size(); i++) {
            assertEquals(i, chunks.get(i).index());
            assertFalse(chunks.get(i).content().isBlank());
        }
    }

    @Test
    @DisplayName("Gemini Service should generate distinct, question-specific answers without repetition")
    void testGeminiDistinctAnswers() {
        String resumeContext = "Candidate Alex Johnson has 5 years of experience in Java, Spring Boot, MySQL, and React. Education: B.S. in Computer Science.";

        // Query 1: Skills
        String replySkills = geminiService.generateResponse("", "What technical skills does this candidate have?", resumeContext, List.of());
        assertNotNull(replySkills);
        assertTrue(replySkills.toLowerCase().contains("java") || replySkills.toLowerCase().contains("spring"));

        // Query 2: Experience
        String replyExp = geminiService.generateResponse("", "How many years of experience does the candidate have?", resumeContext, List.of());
        assertNotNull(replyExp);
        assertTrue(replyExp.toLowerCase().contains("5 years"));

        // Query 3: Subject QA (Level 1 Chatbot)
        String replySubject = geminiService.generateResponse("", "What is Spring Boot?", null, List.of());
        assertNotNull(replySubject);
        assertTrue(replySubject.toLowerCase().contains("spring boot") || replySubject.toLowerCase().contains("framework"));

        // Verify that responses are dynamic and NOT identical!
        assertNotEquals(replySkills, replyExp, "Skills query and Experience query must not produce identical outputs");
        assertNotEquals(replySkills, replySubject, "Document query and General subject query must not produce identical outputs");
    }

    @Test
    @DisplayName("Resume Analysis should extract structured candidate profile")
    void testResumeAnalysis() {
        String resumeText = "Candidate Name: Alex Johnson\nRole: Senior Full Stack Engineer\nEmail: alex@example.com\n5 years of experience in Java, Spring Boot, and React.\nEducation: B.S. in Computer Science from State University.";

        ResumeAnalysisRequest req = ResumeAnalysisRequest.builder().rawText(resumeText).build();
        ResumeAnalysisResponse resp = aiService.analyzeResume(testRecruiter, req);

        assertNotNull(resp);
        assertEquals("Alex Johnson", resp.getCandidateName());
        assertTrue(resp.getTechnicalSkills().contains("Java"));
        assertTrue(resp.getTechnicalSkills().contains("Spring Boot"));
        assertEquals(5, resp.getEstimatedYearsExperience());
    }

    @Test
    @DisplayName("Resume Match should compute match score against job description")
    void testResumeMatch() {
        String resumeText = "Candidate: Alex Johnson. Skills: Java, Spring Boot, Docker, React, MySQL. 5 years of experience.";
        String jdText = "Job: Senior Java Developer. Requirements: Java, Spring Boot, AWS, Kubernetes, Docker. 4+ years experience.";

        ResumeMatchRequest req = ResumeMatchRequest.builder()
                .customJobDescription(jdText)
                .build();

        // Mock document repository for resume lookup
        AiDocument resumeDoc = AiDocument.builder()
                .id(10L)
                .user(testRecruiter)
                .originalFileName("alex_resume.pdf")
                .extractedText(resumeText)
                .build();
        req.setResumeDocumentId(10L);

        when(aiDocumentRepository.findByIdAndUser(10L, testRecruiter)).thenReturn(Optional.of(resumeDoc));

        ResumeMatchResponse match = aiService.matchResumeToJob(testRecruiter, req);
        assertNotNull(match);
        assertTrue(match.getMatchScore() > 0 && match.getMatchScore() <= 100);
        assertTrue(match.getMatchedSkills().contains("Java"));
        assertTrue(match.getMatchedSkills().contains("Spring Boot"));
        assertTrue(match.getMissingSkills().contains("AWS") || match.getMissingSkills().contains("Kubernetes"));
    }
}
