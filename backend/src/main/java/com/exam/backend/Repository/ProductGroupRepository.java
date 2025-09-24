package com.exam.backend.Repository;

import com.exam.backend.Model.ProductGroup;
import com.exam.backend.Model.Section;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductGroupRepository extends JpaRepository<ProductGroup, Long> {
    long countBySection_Id(Long sectionId);

    List<ProductGroup> findBySectionAndEnabledTrueOrderByOrderIndexAsc(Section section);

    // Opcional (no la usamos en el controller actual, pero te la dejo por si querés evitar N+1)
    @EntityGraph(attributePaths = {"items", "items.product", "section"})
    List<ProductGroup> findBySection_SlugAndEnabledTrueOrderByOrderIndexAsc(String slug);
}
