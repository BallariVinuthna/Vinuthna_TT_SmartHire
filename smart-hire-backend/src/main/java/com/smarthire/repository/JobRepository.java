package com.smarthire.repository;

import com.smarthire.entity.Job;
import com.smarthire.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {
    Page<Job> findByRecruiterId(Long recruiterId, Pageable pageable);
    Page<Job> findByCompanyId(Long companyId, Pageable pageable);
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    List<Job> findTop5ByStatusOrderByCreatedAtDesc(JobStatus status);
    long countByStatus(JobStatus status);
    long countByRecruiterId(Long recruiterId);

    @Query("SELECT j FROM Job j WHERE j.status = 'APPROVED' AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Job> searchApprovedJobs(String query, Pageable pageable);
}
