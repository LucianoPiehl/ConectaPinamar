package com.exam.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
        name = "product_group_items",
        uniqueConstraints = {
                @UniqueConstraint(name = "ux_pgi_group_pos", columnNames = {"group_id", "position"})
        },
        indexes = {
                @Index(name = "ix_pgi_group", columnList = "group_id"),
                @Index(name = "ix_pgi_product", columnList = "product_id")
        }
)
public class ProductGroupItem {

    @EmbeddedId
    private ProductGroupItemId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id", nullable = false)
    private ProductGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer position; // orden dentro de la agrupación (0..n)

    public ProductGroupItem() {}

    public ProductGroupItem(ProductGroup group, Product product, int position) {
        this.group = group;
        this.product = product;
        this.position = position;
        // si ambos tienen ID, sincronizamos el embeddable
        if (group != null && group.getId() != null && product != null && product.getId() != null) {
            this.id = new ProductGroupItemId(group.getId(), product.getId());
        }
    }

    @PrePersist
    private void prePersistSyncId() {
        if (this.id == null && this.group != null && this.group.getId() != null
                && this.product != null && this.product.getId() != null) {
            this.id = new ProductGroupItemId(this.group.getId(), this.product.getId());
        }
    }

    // --- getters/setters ---

    public ProductGroupItemId getId() {
        return id;
    }

    public void setId(ProductGroupItemId id) {
        this.id = id;
    }

    public ProductGroup getGroup() {
        return group;
    }

    public void setGroup(ProductGroup group) {
        this.group = group;
        // si ya hay product, intentamos mantener sincronizado el embeddable
        if (this.product != null && group != null
                && group.getId() != null && this.product.getId() != null) {
            this.id = new ProductGroupItemId(group.getId(), this.product.getId());
        }
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
        if (this.group != null && product != null
                && this.group.getId() != null && product.getId() != null) {
            this.id = new ProductGroupItemId(this.group.getId(), product.getId());
        }
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    // --- equals/hashCode basados en la clave compuesta ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProductGroupItem that)) return false;
        // si no hay id aún, usamos identidad de objeto (evita falsos iguales antes de persistir)
        if (this.id == null || that.id == null) return false;
        return this.id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return (id != null ? id.hashCode() : System.identityHashCode(this));
    }
}
