package com.exam.backend.Controller;

import com.exam.backend.DTO.ProductDTO;
import com.exam.backend.Model.Product;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryProductsController {

    private final ProductRepository productRepository;
    public CategoryProductsController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductDTO>> productsByCategory(@PathVariable Long id){
        List<Product> items = productRepository.findByCategoriesIdOrderByPopularityDesc(id);
        List<ProductDTO> out = items.stream().map(Mapper::toProductDTO).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }
}
