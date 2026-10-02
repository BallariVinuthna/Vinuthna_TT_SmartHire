package com.smarthire.service;

import com.smarthire.entity.*;
import com.smarthire.enums.*;
import com.smarthire.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final InterviewRepository interviewRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name:System Admin}")
    private String adminName;

    @Value("${app.admin.email:admin@smarthire.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Seed data already present. Skipping DataInitializer.");
            return;
        }

        log.info("Seeding SmartHire database with initial accounts, companies, jobs, applications, and interviews...");

        // 1. Create Admin
        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .phone("+1 555-0100")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);

        // 2. Create Companies
        Company techCorp = companyRepository.save(Company.builder()
                .name("TechCorp Solutions")
                .description("Leading enterprise software solution provider specializing in cloud systems.")
                .website("https://techcorp.example.com")
                .location("San Francisco, CA")
                .build());

        Company innovateLabs = companyRepository.save(Company.builder()
                .name("InnovateLabs Inc")
                .description("Cutting edge AI & SaaS product engineering venture startup.")
                .website("https://innovatelabs.example.com")
                .location("New York, NY")
                .build());

        Company apexFintech = companyRepository.save(Company.builder()
                .name("Apex Financial Tech")
                .description("Modern high-frequency trading platform and banking tech enterprise.")
                .website("https://apexfintech.example.com")
                .location("Chicago, IL")
                .build());

        // 3. Create Skills
        List<Skill> skills = List.of(
                Skill.builder().name("Java").category("Backend").build(),
                Skill.builder().name("Spring Boot").category("Backend").build(),
                Skill.builder().name("React").category("Frontend").build(),
                Skill.builder().name("TypeScript").category("Frontend").build(),
                Skill.builder().name("Tailwind CSS").category("Frontend").build(),
                Skill.builder().name("MySQL").category("Database").build(),
                Skill.builder().name("Docker").category("DevOps").build(),
                Skill.builder().name("AWS").category("Cloud").build(),
                Skill.builder().name("Python").category("Data Science").build(),
                Skill.builder().name("Node.js").category("Backend").build()
        );
        skills = skillRepository.saveAll(skills);

        // 4. Create Recruiters
        User recruiterUser1 = userRepository.save(User.builder()
                .name("Rachel Green")
                .email("rachel.recruiter@smarthire.com")
                .password(passwordEncoder.encode("Recruiter@123"))
                .phone("+1 555-0199")
                .role(Role.ROLE_RECRUITER)
                .active(true)
                .build());

        RecruiterProfile recruiter1 = recruiterProfileRepository.save(RecruiterProfile.builder()
                .user(recruiterUser1)
                .company(techCorp)
                .title("Senior Technical Recruiter")
                .phone("+1 555-0199")
                .build());

        User recruiterUser2 = userRepository.save(User.builder()
                .name("Marcus Vance")
                .email("marcus.recruiter@smarthire.com")
                .password(passwordEncoder.encode("Recruiter@123"))
                .phone("+1 555-0188")
                .role(Role.ROLE_RECRUITER)
                .active(true)
                .build());

        RecruiterProfile recruiter2 = recruiterProfileRepository.save(RecruiterProfile.builder()
                .user(recruiterUser2)
                .company(innovateLabs)
                .title("Head of Talent Acquisition")
                .phone("+1 555-0188")
                .build());

        // 5. Create Candidates
        List<User> candidateUsers = List.of(
                User.builder().name("Alex Johnson").email("alex.candidate@smarthire.com").password(passwordEncoder.encode("Candidate@123")).phone("+1 555-0101").role(Role.ROLE_CANDIDATE).active(true).build(),
                User.builder().name("Sarah Jenkins").email("sarah.candidate@smarthire.com").password(passwordEncoder.encode("Candidate@123")).phone("+1 555-0102").role(Role.ROLE_CANDIDATE).active(true).build(),
                User.builder().name("David Chen").email("david.candidate@smarthire.com").password(passwordEncoder.encode("Candidate@123")).phone("+1 555-0103").role(Role.ROLE_CANDIDATE).active(true).build(),
                User.builder().name("Emily Davis").email("emily.candidate@smarthire.com").password(passwordEncoder.encode("Candidate@123")).phone("+1 555-0104").role(Role.ROLE_CANDIDATE).active(true).build(),
                User.builder().name("Michael Smith").email("michael.candidate@smarthire.com").password(passwordEncoder.encode("Candidate@123")).phone("+1 555-0105").role(Role.ROLE_CANDIDATE).active(true).build()
        );
        candidateUsers = userRepository.saveAll(candidateUsers);

        List<CandidateProfile> candidateProfiles = new ArrayList<>();
        for (int i = 0; i < candidateUsers.size(); i++) {
            User u = candidateUsers.get(i);
            CandidateProfile cp = candidateProfileRepository.save(CandidateProfile.builder()
                    .user(u)
                    .title(i % 2 == 0 ? "Full Stack Software Engineer" : "Frontend React Developer")
                    .location("Austin, TX")
                    .bio("Passionate software craftsman with experience building resilient web platforms.")
                    .education("B.S. in Computer Science, State University")
                    .experience("3+ years of professional software engineering experience.")
                    .experienceYears(3)
                    .resumeUrl("https://example.com/resumes/" + u.getName().toLowerCase().replace(" ", "_") + ".pdf")
                    .build());
            candidateProfiles.add(cp);

            // Add Candidate Skills
            candidateSkillRepository.save(CandidateSkill.builder().candidateProfile(cp).skill(skills.get(0)).proficiencyLevel("ADVANCED").build());
            candidateSkillRepository.save(CandidateSkill.builder().candidateProfile(cp).skill(skills.get(1)).proficiencyLevel("ADVANCED").build());
            candidateSkillRepository.save(CandidateSkill.builder().candidateProfile(cp).skill(skills.get(2)).proficiencyLevel("INTERMEDIATE").build());
        }

        // 6. Create 10 Jobs
        List<Job> seededJobs = new ArrayList<>();

        Job job1 = jobRepository.save(Job.builder()
                .title("Senior Full Stack Java Developer")
                .description("We are seeking an experienced Full Stack Java Developer to design scalable microservices and React dashboards.")
                .responsibilities("Architect RESTful APIs, optimize MySQL database queries, collaborate with frontend teams.")
                .requirements("5+ years with Spring Boot, Java 17+, React, MySQL, and Docker.")
                .location("San Francisco, CA")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.HYBRID)
                .experienceRequired(5)
                .salaryMin(new BigDecimal("130000"))
                .salaryMax(new BigDecimal("160000"))
                .applicationDeadline(LocalDate.now().plusDays(30))
                .status(JobStatus.APPROVED)
                .recruiter(recruiter1)
                .company(techCorp)
                .build());
        seededJobs.add(job1);

        Job job2 = jobRepository.save(Job.builder()
                .title("Frontend React & TypeScript Engineer")
                .description("Join our dynamic product UI team building next-generation Web applications.")
                .responsibilities("Develop responsive UI components with Tailwind CSS and Lucide React.")
                .requirements("3+ years with modern React, Hooks, Context API, Vite, Tailwind CSS.")
                .location("Remote")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.REMOTE)
                .experienceRequired(3)
                .salaryMin(new BigDecimal("110000"))
                .salaryMax(new BigDecimal("140000"))
                .applicationDeadline(LocalDate.now().plusDays(45))
                .status(JobStatus.APPROVED)
                .recruiter(recruiter2)
                .company(innovateLabs)
                .build());
        seededJobs.add(job2);

        Job job3 = jobRepository.save(Job.builder()
                .title("Backend Spring Boot Specialist")
                .description("Build high-performance REST APIs and real-time transaction engines.")
                .responsibilities("Implement secure Spring Security JWT flows and query optimizations.")
                .requirements("4+ years in Java backend architecture, MySQL, JPA Hibernate.")
                .location("Chicago, IL")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.ON_SITE)
                .experienceRequired(4)
                .salaryMin(new BigDecimal("125000"))
                .salaryMax(new BigDecimal("150000"))
                .applicationDeadline(LocalDate.now().plusDays(20))
                .status(JobStatus.APPROVED)
                .recruiter(recruiter1)
                .company(apexFintech)
                .build());
        seededJobs.add(job3);

        Job job4 = jobRepository.save(Job.builder()
                .title("DevOps & Cloud Engineer")
                .description("Manage CI/CD deployment pipelines, AWS infrastructure, and Kubernetes pods.")
                .responsibilities("Maintain uptime, automate build processes, monitor server health.")
                .requirements("Experience with AWS, Docker, Kubernetes, Terraform, Jenkins.")
                .location("San Francisco, CA")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.HYBRID)
                .experienceRequired(4)
                .salaryMin(new BigDecimal("135000"))
                .salaryMax(new BigDecimal("165000"))
                .applicationDeadline(LocalDate.now().plusDays(60))
                .status(JobStatus.APPROVED)
                .recruiter(recruiter1)
                .company(techCorp)
                .build());
        seededJobs.add(job4);

        Job job5 = jobRepository.save(Job.builder()
                .title("Junior Java Software Engineer")
                .description("Great opportunity for entry-level developers looking to grow in enterprise backend development.")
                .responsibilities("Write unit tests, fix bug tickets, write clean Spring Boot services.")
                .requirements("1-2 years Java development, solid understanding of OOP and relational databases.")
                .location("New York, NY")
                .jobType(JobType.FULL_TIME)
                .workMode(JobMode.HYBRID)
                .experienceRequired(1)
                .salaryMin(new BigDecimal("80000"))
                .salaryMax(new BigDecimal("100000"))
                .applicationDeadline(LocalDate.now().plusDays(15))
                .status(JobStatus.APPROVED)
                .recruiter(recruiter2)
                .company(innovateLabs)
                .build());
        seededJobs.add(job5);

        // Associate Job Skills
        for (Job j : seededJobs) {
            jobSkillRepository.save(JobSkill.builder().job(j).skill(skills.get(0)).build());
            jobSkillRepository.save(JobSkill.builder().job(j).skill(skills.get(1)).build());
            jobSkillRepository.save(JobSkill.builder().job(j).skill(skills.get(2)).build());
        }

        // 7. Create Applications & Audits
        CandidateProfile alexProfile = candidateProfiles.get(0);
        CandidateProfile sarahProfile = candidateProfiles.get(1);

        Application app1 = applicationRepository.save(Application.builder()
                .candidateProfile(alexProfile)
                .job(job1)
                .currentStatus(ApplicationStatus.SHORTLISTED)
                .coverLetter("I am very excited to apply for Senior Full Stack Java Developer position!")
                .build());

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app1)
                .status(ApplicationStatus.APPLIED)
                .notes("Application submitted")
                .changedBy(alexProfile.getUser())
                .build());

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app1)
                .status(ApplicationStatus.SHORTLISTED)
                .notes("Strong profile matching skills")
                .changedBy(recruiterUser1)
                .build());

        Application app2 = applicationRepository.save(Application.builder()
                .candidateProfile(sarahProfile)
                .job(job2)
                .currentStatus(ApplicationStatus.INTERVIEW)
                .coverLetter("Looking forward to discussing my React UI expertise.")
                .build());

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app2)
                .status(ApplicationStatus.APPLIED)
                .notes("Application submitted")
                .changedBy(sarahProfile.getUser())
                .build());

        statusHistoryRepository.save(ApplicationStatusHistory.builder()
                .application(app2)
                .status(ApplicationStatus.INTERVIEW)
                .notes("Invited for technical interview")
                .changedBy(recruiterUser2)
                .build());

        // 8. Create Interview Schedule
        interviewRepository.save(Interview.builder()
                .application(app2)
                .scheduledAt(LocalDateTime.now().plusDays(3).withHour(14).withMinute(0))
                .interviewType("Technical Round - Frontend Architecture")
                .meetingLink("https://meet.google.com/abc-defg-hij")
                .notes("Please prepare a 15-minute walkthrough of a recent React project.")
                .status(InterviewStatus.SCHEDULED)
                .build());

        // 9. Notifications
        notificationRepository.save(Notification.builder()
                .recipient(alexProfile.getUser())
                .title("Application Shortlisted!")
                .message("Your application for Senior Full Stack Java Developer has been shortlisted by TechCorp Solutions.")
                .type(NotificationType.APPLICATION_STATUS_UPDATED)
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .recipient(sarahProfile.getUser())
                .title("Interview Scheduled!")
                .message("Interview scheduled for Frontend React & TypeScript Engineer on " + LocalDateTime.now().plusDays(3).toLocalDate())
                .type(NotificationType.INTERVIEW_SCHEDULED)
                .isRead(false)
                .build());

        log.info("SmartHire database seed completed successfully!");
        log.info("Admin Credentials: {} / {}", adminEmail, adminPassword);
        log.info("Recruiter Credentials: rachel.recruiter@smarthire.com / Recruiter@123");
        log.info("Candidate Credentials: alex.candidate@smarthire.com / Candidate@123");
    }
}
