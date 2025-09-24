package com.exam.backend.Repository;

import com.exam.backend.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findTop20ByNameContainingIgnoreCaseOrderByIdDesc(String q);
    List<Product> findByCategoriesIdOrderByPopularityDesc(Long categoryId);
    List<Product> findBySellerIdOrderByPopularityDesc(Long sellerId);
    List<Product> findAllByOrderByPopularityDesc(Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String q, Pageable pageable);
    long countByCategories_Id(Long categoryId);  // para borrado restrictivo de Category
    long countBySeller_Id(Long sellerId);        // para borrado restrictivo de Seller

}
