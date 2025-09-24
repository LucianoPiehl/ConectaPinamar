package com.exam.backend.Repository;

import com.exam.backend.Model.ProductGroup;
import com.exam.backend.Model.ProductGroupItem;
import com.exam.backend.Model.ProductGroupItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductGroupItemRepository extends JpaRepository<ProductGroupItem, ProductGroupItemId> {

    long countByProduct_Id(Long productId);

    List<ProductGroupItem> findByGroupOrderByPositionAsc(ProductGroup group);

    /**
     * Borra todos los items de un grupo.
     * Necesita @Modifying + @Transactional para ejecutar el DELETE como operación DML.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    void deleteByGroup(ProductGroup group);
}
