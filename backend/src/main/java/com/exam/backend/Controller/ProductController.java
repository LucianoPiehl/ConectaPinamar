package com.exam.backend.Controller;

import com.exam.backend.DTO.ProductDTO;
import com.exam.backend.Model.Product;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository repo;
    public ProductController(ProductRepository repo) { this.repo = repo; }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> get(@PathVariable Long id){
        Optional<Product> p = repo.findById(id);
        return p.map(value -> ResponseEntity.ok(Mapper.toProductDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
