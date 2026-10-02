package com.smarthire.repository;

import com.smarthire.entity.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateProfileId(Long candidateProfileId);
    void deleteByCandidateProfileId(Long candidateProfileId);
}
