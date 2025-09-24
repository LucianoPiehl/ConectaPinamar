package com.exam.backend.Controller;

import com.exam.backend.DTO.*;
import com.exam.backend.Model.Category;
import com.exam.backend.Model.Product;
import com.exam.backend.Model.Seller;
import com.exam.backend.Repository.CategoryRepository;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Repository.SellerRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SearchController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;

    public SearchController(ProductRepository productRepository, CategoryRepository categoryRepository, SellerRepository sellerRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.sellerRepository = sellerRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String q) {
        String term = Optional.ofNullable(q).orElse("").trim();
        if (term.isEmpty()) {
            Map<String,Object> empty = new HashMap<>();
            empty.put("products", List.of());
            empty.put("categories", List.of());
            empty.put("sellers", List.of());
            return ResponseEntity.ok(empty);
        }

        List<Product> prods = productRepository.findTop20ByNameContainingIgnoreCaseOrderByIdDesc(term);
        List<Category> cats = categoryRepository.findTop20ByNameContainingIgnoreCaseOrderByIdAsc(term);
        List<Seller> sellers = sellerRepository.findTop20ByNameContainingIgnoreCaseOrderByIdDesc(term);

        List<ProductDTO> prodDTO = prods.stream().map(Mapper::toProductDTO).collect(java.util.stream.Collectors.toList());
        List<CategoryDTO> catDTO = cats.stream().map(Mapper::toCategoryDTO).collect(java.util.stream.Collectors.toList());
        List<SellerDTO> selDTO = sellers.stream().map(Mapper::toSellerDTO).collect(java.util.stream.Collectors.toList());

        Map<String,Object> payload = new HashMap<>();
        payload.put("products", prodDTO);
        payload.put("categories", catDTO);
        payload.put("sellers", selDTO);
        return ResponseEntity.ok(payload);
    }
}
