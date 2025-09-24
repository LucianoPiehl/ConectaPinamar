package com.exam.backend.Model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductGroupItemId implements Serializable {
    private Long groupId;
    private Long productId;

    public ProductGroupItemId() {}
    public ProductGroupItemId(Long groupId, Long productId) {
        this.groupId = groupId; this.productId = productId;
    }
    public Long getGroupId() { return groupId; }
    public Long getProductId() { return productId; }

    @Override public boolean equals(Object o) {
        if (this == o) return true; if (o == null || getClass() != o.getClass()) return false;
        ProductGroupItemId that = (ProductGroupItemId) o;
        return Objects.equals(groupId, that.groupId) && Objects.equals(productId, that.productId);
    }
    @Override public int hashCode() { return Objects.hash(groupId, productId); }
}
