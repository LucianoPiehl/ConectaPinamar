package com.exam.backend.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "sections", indexes = {
        @Index(name = "ux_sections_slug", columnList = "slug", unique = true)
})
public class Section {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, unique=true)
    private String slug;          // p.ej. "solo-semana", "2x1"

    @Column(name="order_index")
    private Integer orderIndex = 0;

    @Column(nullable=false)
    private Boolean enabled = true;

    // --- getters/setters ---
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
