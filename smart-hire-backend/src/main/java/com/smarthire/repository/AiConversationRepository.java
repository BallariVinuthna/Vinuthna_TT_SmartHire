package com.smarthire.repository;

import com.smarthire.entity.AiConversation;
import com.smarthire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByUserOrderByUpdatedAtDesc(User user);
    java.util.Optional<AiConversation> findByIdAndUser(Long id, User user);
    void deleteByIdAndUser(Long id, User user);
}
