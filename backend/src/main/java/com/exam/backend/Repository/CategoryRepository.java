package com.exam.backend.Repository;

import com.exam.backend.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findTop20ByNameContainingIgnoreCaseOrderByIdAsc(String q);
    Page<Category> findByNameContainingIgnoreCase(String q, Pageable pageable);

}
