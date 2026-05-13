package com.nihongo.platform.repository;

import com.nihongo.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByOauthIdAndOauthProvider(String oauthId, String provider);
    boolean existsByEmail(String email);

    List<User> findByRoleAndStatus(User.Role role, User.Status status);
    List<User> findByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<User> searchStudents(@Param("q") String query);
}
