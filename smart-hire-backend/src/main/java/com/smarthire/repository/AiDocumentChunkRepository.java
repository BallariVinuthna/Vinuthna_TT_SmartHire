package com.smarthire.repository;

import com.smarthire.entity.AiDocument;
import com.smarthire.entity.AiDocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiDocumentChunkRepository extends JpaRepository<AiDocumentChunk, Long> {

    List<AiDocumentChunk> findByDocumentOrderByChunkIndexAsc(AiDocument document);

    @Query("SELECT c FROM AiDocumentChunk c WHERE c.document.user.id = :userId ORDER BY c.createdAt DESC")
    List<AiDocumentChunk> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM AiDocumentChunk c WHERE c.document.id = :documentId")
    void deleteByDocumentId(@Param("documentId") Long documentId);
}
