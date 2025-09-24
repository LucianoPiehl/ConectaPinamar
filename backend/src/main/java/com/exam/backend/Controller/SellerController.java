package com.exam.backend.Controller;

import com.exam.backend.DTO.SellerDTO;
import com.exam.backend.Model.Product;
import com.exam.backend.Model.Seller;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Repository.SellerRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "*")
public class SellerController {

    private final SellerRepository repo;
    private final ProductRepository productRepository;

    public SellerController(SellerRepository repo, ProductRepository productRepository) {
        this.repo = repo;
        this.productRepository = productRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerDTO> get(@PathVariable Long id){
        Optional<Seller> s = repo.findById(id);
        return s.map(value -> ResponseEntity.ok(Mapper.toSellerDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Productos del vendedor (para el slider de su página)
    @GetMapping("/{id}/products")
    public ResponseEntity<java.util.List<com.exam.backend.DTO.ProductDTO>> products(@PathVariable Long id){
        java.util.List<Product> items = productRepository.findBySellerIdOrderByPopularityDesc(id);
        java.util.List<com.exam.backend.DTO.ProductDTO> out = items.stream().map(Mapper::toProductDTO).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @PostMapping("/{id}/visit")
    public ResponseEntity<Void> visit(@PathVariable Long id){
        Optional<Seller> s = repo.findById(id);
        if (s.isEmpty()) return ResponseEntity.notFound().build();
        Seller sel = s.get();
        sel.setVisitCount(sel.getVisitCount() + 1);
        repo.save(sel);
        return ResponseEntity.ok().build();
    }
}
