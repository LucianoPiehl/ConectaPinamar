package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.SellerDTO;
import com.exam.backend.Model.Seller;
import com.exam.backend.Repository.ProductRepository;   // ⬅ nuevo
import com.exam.backend.Repository.SellerRepository;
import com.exam.backend.Service.Mapper;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/sellers")
@CrossOrigin(origins = "*")
public class SellerAdminController extends AdminBaseController {

    private final SellerRepository repo;
    private final ProductRepository productRepo; // ⬅ inyectamos para borrado restrictivo

    public SellerAdminController(SellerRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public Page<SellerDTO> list(@RequestParam(defaultValue="") String q,
                                @RequestParam(defaultValue="0") int page,
                                @RequestParam(defaultValue="10") int size,
                                @RequestParam(required=false) String sort,
                                @RequestParam(defaultValue="desc") String dir) {
        var pageable = page(page, size, sort, dir);
        Page<Seller> result = (q==null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNameContainingIgnoreCase(q, pageable);
        return result.map(Mapper::toSellerDTO);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Seller body){
        try {
            Seller s = new Seller();
            s.setName(body.getName());
            s.setDescription(trimToNull(body.getDescription()));
            s.setLocation(trimToNull(body.getLocation()));
            s.setContactPhone(trimToNull(body.getContactPhone()));
            s.setContactEmail(trimToNull(body.getContactEmail()));
            s.setImageUrl(trimToNull(body.getImageUrl()));
            s.setFacebookUrl(trimToNull(body.getFacebookUrl()));
            s.setInstagramUrl(trimToNull(body.getInstagramUrl()));
            s.setWhatsappUrl(trimToNull(body.getWhatsappUrl()));
            s.setLatitude(body.getLatitude());
            s.setLongitude(body.getLongitude());
            s.setVisitCount(0L);
            return ResponseEntity.ok(Mapper.toSellerDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Seller body){
        Optional<Seller> o = repo.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();
        Seller s = o.get();
        s.setName(body.getName());
        s.setDescription(trimToNull(body.getDescription()));
        s.setLocation(trimToNull(body.getLocation()));
        s.setContactPhone(trimToNull(body.getContactPhone()));
        s.setContactEmail(trimToNull(body.getContactEmail()));
        if (body.getImageUrl() != null) {
            s.setImageUrl(trimToNull(body.getImageUrl()));
        }
        s.setFacebookUrl(trimToNull(body.getFacebookUrl()));
        s.setInstagramUrl(trimToNull(body.getInstagramUrl()));
        s.setWhatsappUrl(trimToNull(body.getWhatsappUrl()));
        s.setLatitude(body.getLatitude());
        s.setLongitude(body.getLongitude());
        try {
            return ResponseEntity.ok(Mapper.toSellerDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        // 🔒 Restrictivo: no permitir borrar si hay productos del seller
        if (productRepo.countBySeller_Id(id) > 0) {
            return ResponseEntity.status(409).body(java.util.Map.of("error","in-use"));
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
