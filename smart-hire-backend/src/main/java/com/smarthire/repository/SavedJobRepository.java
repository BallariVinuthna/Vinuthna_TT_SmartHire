package com.smarthire.repository;

import com.smarthire.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    Page<SavedJob> findByCandidateProfileId(Long candidateProfileId, Pageable pageable);
    boolean existsByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
    Optional<SavedJob> findByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
    long countByCandidateProfileId(Long candidateProfileId);
    void deleteByCandidateProfileIdAndJobId(Long candidateProfileId, Long jobId);
}
