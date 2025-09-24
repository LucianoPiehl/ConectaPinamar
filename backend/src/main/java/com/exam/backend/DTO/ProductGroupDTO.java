package com.exam.backend.DTO;

import java.util.List;

public class ProductGroupDTO {
    private Long id;
    private String title;
    private String variant; // opcional, para variantes de layout
    private List<ProductLiteDTO> products;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }
    public List<ProductLiteDTO> getProducts() { return products; }
    public void setProducts(List<ProductLiteDTO> products) { this.products = products; }
}
