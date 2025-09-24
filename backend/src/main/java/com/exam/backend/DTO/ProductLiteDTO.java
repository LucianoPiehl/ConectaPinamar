package com.exam.backend.DTO;

public class ProductLiteDTO {
    private Long id;
    private String imageUrl; // ¡OJO! En tu modelo es Product.image

    public ProductLiteDTO() {}
    public ProductLiteDTO(Long id, String imageUrl) {
        this.id = id; this.imageUrl = imageUrl;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
