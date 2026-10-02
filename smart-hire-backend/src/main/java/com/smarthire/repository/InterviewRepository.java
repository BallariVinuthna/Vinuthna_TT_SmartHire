package com.smarthire.repository;

import com.smarthire.entity.Interview;
import com.smarthire.enums.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Page<Interview> findByApplicationCandidateProfileId(Long candidateProfileId, Pageable pageable);
    Page<Interview> findByApplicationJobRecruiterId(Long recruiterId, Pageable pageable);
    
    long countByApplicationCandidateProfileIdAndScheduledAtAfter(Long candidateProfileId, LocalDateTime now);
    long countByApplicationJobRecruiterId(Long recruiterId);
    
    List<Interview> findTop5ByApplicationCandidateProfileIdAndScheduledAtAfterOrderByScheduledAtAsc(Long candidateProfileId, LocalDateTime now);
    List<Interview> findTop5ByApplicationJobRecruiterIdAndScheduledAtAfterOrderByScheduledAtAsc(Long recruiterId, LocalDateTime now);
}
