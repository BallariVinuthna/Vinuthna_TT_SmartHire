package com.smarthire.repository;

import com.smarthire.entity.AiDocument;
import com.smarthire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiDocumentRepository extends JpaRepository<AiDocument, Long> {
    List<AiDocument> findByUserOrderByCreatedAtDesc(User user);
    List<AiDocument> findByUserAndOriginalFileName(User user, String originalFileName);
    java.util.Optional<AiDocument> findByIdAndUser(Long id, User user);
    void deleteByIdAndUser(Long id, User user);
}
