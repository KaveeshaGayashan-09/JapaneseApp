package com.nihongo.platform.repository;

import com.nihongo.platform.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByScheduledAtAfterOrderByScheduledAtAsc(LocalDateTime after);
    List<Session> findAllByOrderByScheduledAtDesc();
    Optional<Session> findByZoomMeetingId(String zoomMeetingId);
}
