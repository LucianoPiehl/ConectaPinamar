package com.exam.backend.Model;

import jakarta.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "product_groups", indexes = {
        @Index(name = "ix_pg_section", columnList = "section_id, order_index")
})
public class ProductGroup {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;                 // opcional para el admin

    @Column(name="variant")
    private String variant;               // libre: "row", "grid2", etc. (front decide)

    @Column(name="order_index")
    private Integer orderIndex = 0;       // orden dentro de la sección

    @Column(nullable=false)
    private Boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable=false)
    private Section section;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private Set<ProductGroupItem> items = new LinkedHashSet<>();

    // --- getters/setters ---
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }
    public Set<ProductGroupItem> getItems() { return items; }
    public void setItems(Set<ProductGroupItem> items) { this.items = items; }
}
