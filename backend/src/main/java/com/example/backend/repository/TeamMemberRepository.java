package com.example.backend.repository;

import com.example.backend.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByTeamId(String teamId);
    List<TeamMember> findByUserIdAndStatus(String userId, String status);
    Optional<TeamMember> findByTeamIdAndUserId(String teamId, String userId);

    @org.springframework.data.jpa.repository.Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.team WHERE tm.userId = :userId AND tm.status = :status")
    List<TeamMember> findByUserIdAndStatusWithTeam(@org.springframework.data.repository.query.Param("userId") String userId, @org.springframework.data.repository.query.Param("status") String status);

    @org.springframework.data.jpa.repository.Query("SELECT tm FROM TeamMember tm LEFT JOIN FETCH tm.team t LEFT JOIN FETCH t.captain WHERE tm.userId = :userId AND tm.status = :status")
    List<TeamMember> findByUserIdAndStatusWithTeamAndCaptain(@org.springframework.data.repository.query.Param("userId") String userId, @org.springframework.data.repository.query.Param("status") String status);

    @org.springframework.data.jpa.repository.Query("SELECT tm FROM TeamMember tm JOIN FETCH tm.user WHERE tm.teamId = :teamId")
    List<TeamMember> findByTeamIdWithUser(@org.springframework.data.repository.query.Param("teamId") String teamId);
}