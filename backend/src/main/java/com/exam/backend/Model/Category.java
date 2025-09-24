package com.exam.backend.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name cannot be blank")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Column(columnDefinition="TEXT")
    private String description;

    // ⬇️ NUEVO
    @Column(name = "image_url")
    private String imageUrl;


    @ManyToMany(mappedBy = "categories")
    private Set<Product> products = new HashSet<>();

    public Category() {}

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Set<Product> getProducts() { return products; }
    public void setProducts(Set<Product> products) { this.products = products; }
    public String getImageUrl() { return imageUrl; }           // ⬅️ NUEVO
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; } // ⬅️ NUEVO

}
