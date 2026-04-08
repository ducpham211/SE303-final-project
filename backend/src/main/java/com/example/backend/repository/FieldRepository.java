package com.example.backend.repository;

import com.example.backend.entity.Field;
import com.example.backend.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FieldRepository extends JpaRepository<Field, String> {
    @EntityGraph(attributePaths = {"timeSlots"})
    List<Field> findAll();

    @Query("SELECT DISTINCT f FROM Field f LEFT JOIN FETCH f.timeSlots ts WHERE " +
           "(:#{#type == null ? 1 : 0} = 1 OR f.type = :type) AND " +
           "(:#{#minPrice == null ? 1 : 0} = 1 OR ts.price >= :minPrice) AND " +
           "(:#{#maxPrice == null ? 1 : 0} = 1 OR ts.price <= :maxPrice)")
    List<Field> findFieldsWithFilters(@Param("type") Enums.FieldType type,
                                      @Param("minPrice") BigDecimal minPrice,
                                      @Param("maxPrice") BigDecimal maxPrice);
}

