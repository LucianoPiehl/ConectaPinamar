package com.exam.backend.Controller;

import com.exam.backend.DTO.ProductDTO;
import com.exam.backend.Model.Product;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductHomeController {

    private final ProductRepository productRepository;

    public ProductHomeController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/home")
    public List<ProductDTO> home(@RequestParam(defaultValue = "12") int limit) {
        int capped = Math.max(1, Math.min(limit, 50));
        List<Product> items = productRepository.findAllByOrderByPopularityDesc(PageRequest.of(0, capped));
        return items.stream().map(Mapper::toProductDTO).collect(Collectors.toList());
    }
}
