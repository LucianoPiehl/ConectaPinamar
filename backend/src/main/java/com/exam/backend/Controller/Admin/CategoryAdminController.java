package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.CategoryDTO;
import com.exam.backend.Model.Category;
import com.exam.backend.Repository.CategoryRepository;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Service.Mapper;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "*")
public class CategoryAdminController extends AdminBaseController {

    private final CategoryRepository repo;
    private final ProductRepository productRepo; // ⬅ inyectamos para borrado restrictivo

    public CategoryAdminController(CategoryRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public Page<CategoryDTO> list(@RequestParam(defaultValue = "") String q,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size,
                                  @RequestParam(required = false) String sort,
                                  @RequestParam(defaultValue = "desc") String dir) {
        var pageable = page(page, size, sort, dir);
        Page<Category> result = (q == null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNameContainingIgnoreCase(q, pageable);
        return result.map(Mapper::toCategoryDTO);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Category body) {
        try {
            Category c = new Category();
            c.setName(body.getName());
            c.setDescription(body.getDescription());
            c.setImageUrl(body.getImageUrl());
            return ResponseEntity.ok(Mapper.toCategoryDTO(repo.save(c)));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", "unique-violation"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Category body) {
        Optional<Category> o = repo.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();
        Category c = o.get();
        c.setName(body.getName());
        c.setDescription(body.getDescription());
        c.setImageUrl(body.getImageUrl());
        try {
            return ResponseEntity.ok(Mapper.toCategoryDTO(repo.save(c)));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", "unique-violation"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        // 🔒 Restrictivo: no permitir borrar si hay productos vinculados a la categoría
        if (productRepo.countByCategories_Id(id) > 0) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", "in-use"));
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
