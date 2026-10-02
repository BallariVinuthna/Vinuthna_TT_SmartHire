package com.smarthire.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@smarthire.com}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.warn("Could not send email to {}: {}. (Email content logged for dev mode)", to, e.getMessage());
        }
    }

    public void sendWelcomeEmail(String toEmail, String name, String role) {
        String subject = "Welcome to SmartHire!";
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Welcome to SmartHire, %s!</h2>
                <p>Thank you for registering as a <strong>%s</strong> on SmartHire.</p>
                <p>We are thrilled to have you onboard. Start exploring opportunities or finding top talent today!</p>
                <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">SmartHire Recruitment Team</p>
                </div>
            </div>
            """, name, role);
        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendApplicationSubmittedEmail(String candidateEmail, String candidateName, String jobTitle, String companyName) {
        String subject = "Application Submitted: " + jobTitle;
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Application Confirmation</h2>
                <p>Hello %s,</p>
                <p>Your application for <strong>%s</strong> at <strong>%s</strong> has been successfully submitted.</p>
                <p>The recruiter will review your profile and update you on the next steps.</p>
            </div>
            """, candidateName, jobTitle, companyName);
        sendEmail(candidateEmail, subject, htmlContent);
    }

    public void sendApplicationStatusUpdateEmail(String candidateEmail, String candidateName, String jobTitle, String status, String notes) {
        String subject = "Application Status Update: " + jobTitle;
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Application Status Updated</h2>
                <p>Hello %s,</p>
                <p>Your application status for <strong>%s</strong> has been updated to: <span style="font-weight: bold; color: #1e40af;">%s</span>.</p>
                %s
            </div>
            """, candidateName, jobTitle, status, (notes != null && !notes.isBlank()) ? "<p><strong>Notes:</strong> " + notes + "</p>" : "");
        sendEmail(candidateEmail, subject, htmlContent);
    }

    public void sendInterviewScheduledEmail(String candidateEmail, String candidateName, String jobTitle, String scheduledAt, String meetingLink) {
        String subject = "Interview Scheduled: " + jobTitle;
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Interview Scheduled!</h2>
                <p>Hello %s,</p>
                <p>An interview for <strong>%s</strong> has been scheduled.</p>
                <p><strong>Date & Time:</strong> %s</p>
                %s
            </div>
            """, candidateName, jobTitle, scheduledAt, (meetingLink != null && !meetingLink.isBlank()) ? "<p><strong>Meeting Link:</strong> <a href='" + meetingLink + "'>" + meetingLink + "</a></p>" : "");
        sendEmail(candidateEmail, subject, htmlContent);
    }

    public void sendPasswordResetEmail(String toEmail, String name, String resetLink) {
        String subject = "SmartHire — Password Reset Request";
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #dc2626;">Password Reset Request</h2>
                <p>Hello %s,</p>
                <p>You recently requested to reset your password. Click the link below to set a new password:</p>
                <p><a href="%s" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p style="color: #64748b; font-size: 12px;">This token expires in 1 hour. If you did not request this, please ignore this email.</p>
            </div>
            """, name, resetLink);
        sendEmail(toEmail, subject, htmlContent);
    }
}
