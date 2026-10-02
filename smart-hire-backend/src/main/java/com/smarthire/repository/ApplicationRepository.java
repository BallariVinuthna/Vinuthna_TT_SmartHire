package com.smarthire.repository;

import com.smarthire.entity.Application;
import com.smarthire.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Page<Application> findByCandidateProfileId(Long candidateProfileId, Pageable pageable);
    Page<Application> findByJobId(Long jobId, Pageable pageable);
    Page<Application> findByJobRecruiterId(Long recruiterId, Pageable pageable);
    boolean existsByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
    Optional<Application> findByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);

    long countByCandidateProfileId(Long candidateProfileId);
    long countByCandidateProfileIdAndCurrentStatus(Long candidateProfileId, ApplicationStatus status);
    
    long countByJobRecruiterId(Long recruiterId);
    long countByJobRecruiterIdAndCurrentStatus(Long recruiterId, ApplicationStatus status);

    long countByCurrentStatus(ApplicationStatus status);

    @Query("SELECT a.currentStatus, COUNT(a) FROM Application a GROUP BY a.currentStatus")
    List<Object[]> countApplicationsGroupByStatus();

    @Query("SELECT a.currentStatus, COUNT(a) FROM Application a WHERE a.job.recruiter.id = :recruiterId GROUP BY a.currentStatus")
    List<Object[]> countRecruiterApplicationsGroupByStatus(Long recruiterId);
}
