// Repository/SectionRepository.java
package com.exam.backend.Repository;
import com.exam.backend.Model.Section;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface SectionRepository extends JpaRepository<Section, Long> {
    Optional<Section> findBySlug(String slug);
    List<Section> findByEnabledTrueOrderByOrderIndexAsc();
    Page<Section> findByNameContainingIgnoreCase(String q, Pageable pageable);

}
