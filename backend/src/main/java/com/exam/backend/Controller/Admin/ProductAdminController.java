package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.ProductDTO;
import com.exam.backend.Model.Category;
import com.exam.backend.Model.Product;
import com.exam.backend.Model.Seller;
import com.exam.backend.Repository.CategoryRepository;
import com.exam.backend.Repository.ProductGroupItemRepository; // ⬅ nuevo
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Repository.SellerRepository;
import com.exam.backend.Service.Mapper;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*")
public class ProductAdminController extends AdminBaseController {

    private final ProductRepository productRepo;
    private final SellerRepository sellerRepo;
    private final CategoryRepository categoryRepo;
    private final ProductGroupItemRepository pgiRepo;  // ⬅ inyectamos para borrado restrictivo

    public ProductAdminController(ProductRepository productRepo,
                                  SellerRepository sellerRepo,
                                  CategoryRepository categoryRepo,
                                  ProductGroupItemRepository pgiRepo) {
        this.productRepo = productRepo;
        this.sellerRepo = sellerRepo;
        this.categoryRepo = categoryRepo;
        this.pgiRepo = pgiRepo;
    }

    public static class ProductPayload {
        public String name;
        public String description;
        public String imageUrl; // maps to Product.image
        public Double price;
        public Integer popularity;
        public Long sellerId;
        public List<Long> categoryIds;
    }

    @GetMapping
    public Page<ProductDTO> list(@RequestParam(defaultValue="") String q,
                                 @RequestParam(defaultValue="0") int page,
                                 @RequestParam(defaultValue="10") int size,
                                 @RequestParam(required=false) String sort,
                                 @RequestParam(defaultValue="desc") String dir){
        var pageable = page(page, size, sort, dir);
        Page<Product> result = (q==null || q.isBlank())
                ? productRepo.findAll(pageable)
                : productRepo.findByNameContainingIgnoreCase(q, pageable);
        return result.map(Mapper::toProductDTO);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProductPayload body){
        Optional<Seller> s = sellerRepo.findById(body.sellerId);
        if (s.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","seller-not-found"));

        Product p = new Product();
        p.setName(body.name);
        p.setDescription(body.description);
        p.setImage(body.imageUrl);
        p.setPrice(body.price);
        p.setPopularity(body.popularity==null?0:body.popularity);
        p.setSeller(s.get());

        if (body.categoryIds != null && !body.categoryIds.isEmpty()){
            List<Category> cats = categoryRepo.findAllById(body.categoryIds);
            p.setCategories(new java.util.HashSet<>(cats));
        }
        return ResponseEntity.ok(Mapper.toProductDTO(productRepo.save(p)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ProductPayload body){
        Optional<Product> op = productRepo.findById(id);
        if (op.isEmpty()) return ResponseEntity.notFound().build();
        Product p = op.get();

        if (body.sellerId != null){
            Optional<Seller> s = sellerRepo.findById(body.sellerId);
            if (s.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","seller-not-found"));
            p.setSeller(s.get());
        }

        p.setName(body.name);
        p.setDescription(body.description);
        p.setImage(body.imageUrl);
        p.setPrice(body.price);
        p.setPopularity(body.popularity==null?0:body.popularity);

        if (body.categoryIds != null){
            List<Category> cats = categoryRepo.findAllById(body.categoryIds);
            p.setCategories(new java.util.HashSet<>(cats));
        }
        try {
            return ResponseEntity.ok(Mapper.toProductDTO(productRepo.save(p)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(Map.of("error","unique-violation"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        // 🔒 Restrictivo: no permitir borrar si el producto está en alguna agrupación
        if (pgiRepo.countByProduct_Id(id) > 0) {
            return ResponseEntity.status(409).body(Map.of("error","in-group"));
        }
        productRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
