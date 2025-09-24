package com.exam.backend.Repository;

import com.exam.backend.Model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    List<Seller> findTop20ByNameContainingIgnoreCaseOrderByIdDesc(String q);
    Page<Seller> findByNameContainingIgnoreCase(String q, Pageable pageable);
}
