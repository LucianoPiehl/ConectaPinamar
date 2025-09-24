package com.exam.backend.DTO;
import java.util.List;
public class ProductDTO {
  public Long id;
  public String name;
  public String description;
  public String imageUrl;
  public Double price;
  public SellerMiniDTO seller;
  public java.util.List<CategoryDTO> categories;
}
