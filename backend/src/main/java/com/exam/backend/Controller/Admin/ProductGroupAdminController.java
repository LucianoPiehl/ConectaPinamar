package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.ProductGroupDTO;
import com.exam.backend.DTO.ProductLiteDTO;
import com.exam.backend.Model.Product;
import com.exam.backend.Model.ProductGroup;
import com.exam.backend.Model.ProductGroupItem;
import com.exam.backend.Model.ProductGroupItemId;
import com.exam.backend.Repository.ProductGroupItemRepository;
import com.exam.backend.Repository.ProductGroupRepository;
import com.exam.backend.Repository.ProductRepository;
import com.exam.backend.Repository.SectionRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/product-groups")
@CrossOrigin(origins = "*")
public class ProductGroupAdminController extends AdminBaseController {

    private final ProductGroupRepository repo;
    private final SectionRepository sectionRepo;
    private final ProductRepository productRepo;
    private final ProductGroupItemRepository itemRepo;

    public ProductGroupAdminController(ProductGroupRepository repo,
                                       SectionRepository sectionRepo,
                                       ProductRepository productRepo,
                                       ProductGroupItemRepository itemRepo) {
        this.repo = repo;
        this.sectionRepo = sectionRepo;
        this.productRepo = productRepo;
        this.itemRepo = itemRepo;
    }

    public static class GroupPayload {
        public String title;
        public String variant;
        public Integer orderIndex;
        public Boolean enabled;
        public Long sectionId;
        public List<Long> productIds; // opcional: set inicial
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductGroupDTO> get(@PathVariable Long id){
        var g = repo.findById(id).orElse(null);
        if (g == null) return ResponseEntity.notFound().build();
        var items = itemRepo.findByGroupOrderByPositionAsc(g);
        return ResponseEntity.ok(toGroupDTO(g, items));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody GroupPayload body){
        var sec = sectionRepo.findById(body.sectionId);
        if (sec.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","section-not-found"));

        ProductGroup g = new ProductGroup();
        g.setTitle(body.title);
        g.setVariant(body.variant);
        g.setOrderIndex(body.orderIndex==null?0:body.orderIndex);
        g.setEnabled(body.enabled==null?true:body.enabled);
        g.setSection(sec.get());
        g = repo.save(g);

        // set inicial de items (si viene)
        if (body.productIds != null && !body.productIds.isEmpty()){
            int pos = 0;
            for (Long pid : body.productIds){
                var p = productRepo.findById(pid).orElse(null);
                if (p == null) continue;
                var it = new ProductGroupItem();
                it.setId(new ProductGroupItemId(g.getId(), p.getId()));
                it.setGroup(g);
                it.setProduct(p);
                it.setPosition(pos++);
                itemRepo.save(it);
            }
        }
        var items = itemRepo.findByGroupOrderByPositionAsc(g);
        return ResponseEntity.ok(toGroupDTO(g, items));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody GroupPayload body){
        var og = repo.findById(id);
        if (og.isEmpty()) return ResponseEntity.notFound().build();
        ProductGroup g = og.get();

        g.setTitle(body.title);
        g.setVariant(body.variant);
        g.setOrderIndex(body.orderIndex==null?0:body.orderIndex);
        g.setEnabled(body.enabled==null?true:body.enabled);
        if (body.sectionId != null){
            var sec = sectionRepo.findById(body.sectionId);
            if (sec.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","section-not-found"));
            g.setSection(sec.get());
        }
        g = repo.save(g);
        var items = itemRepo.findByGroupOrderByPositionAsc(g);
        return ResponseEntity.ok(toGroupDTO(g, items));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id){
        var og = repo.findById(id);
        if (og.isEmpty()) return ResponseEntity.notFound().build();
        var g = og.get();
        // borramos items primero (por si no hay cascade/orphanRemoval en entidad)
        itemRepo.deleteByGroup(g);
        repo.delete(g);
        return ResponseEntity.noContent().build();
    }

    // ------------- items -------------
    public static class ItemsPayload { public List<Long> productIds; }

    /** Reemplaza membresía + orden (botón “Guardar / reemplazar items”). */
    @PutMapping("/{id}/items")
    @Transactional
    public ResponseEntity<?> replaceItems(@PathVariable Long id, @RequestBody ItemsPayload payload){
        var og = repo.findById(id);
        if (og.isEmpty()) return ResponseEntity.notFound().build();
        var g = og.get();

        // normalizamos
        List<Long> ids = (payload.productIds == null) ? List.of() : payload.productIds;

        // limpiar todo (en DB y en memoria)
        itemRepo.deleteByGroup(g);

        // reconstruir
        int pos = 0;
        if (!ids.isEmpty()){
            var prods = productRepo.findAllById(ids);
            // mapa para resolver ids inexistentes sin más SELECTs
            var byId = new java.util.HashMap<Long, Product>(prods.size());
            for (var p : prods) byId.put(p.getId(), p);

            for (Long pid : ids){
                var p = byId.get(pid);
                if (p == null) continue;
                var it = new ProductGroupItem();
                it.setId(new ProductGroupItemId(g.getId(), p.getId()));
                it.setGroup(g);
                it.setProduct(p);
                it.setPosition(pos++);
                itemRepo.save(it);
            }
        }
        var items = itemRepo.findByGroupOrderByPositionAsc(g);
        return ResponseEntity.ok(toGroupDTO(g, items));
    }

    /** Sólo cambiar el orden (botón “Sólo guardar orden”). */
    @PutMapping("/{id}/items/order")
    @Transactional
    public ResponseEntity<?> reorder(@PathVariable Long id, @RequestBody ItemsPayload payload){
        var og = repo.findById(id);
        if (og.isEmpty()) return ResponseEntity.notFound().build();
        var g = og.get();
        if (payload.productIds == null) return ResponseEntity.badRequest().body(Map.of("error","empty-list"));

        var current = itemRepo.findByGroupOrderByPositionAsc(g);
        Map<Long, ProductGroupItem> byPid = new HashMap<>();
        for (var it : current) byPid.put(it.getProduct().getId(), it);

        int pos = 0;
        for (Long pid : payload.productIds){
            var it = byPid.get(pid);
            if (it != null){
                it.setPosition(pos++);
                itemRepo.save(it);
            }
        }
        var items = itemRepo.findByGroupOrderByPositionAsc(g);
        return ResponseEntity.ok(toGroupDTO(g, items));
    }

    // ------- helpers -------
    private ProductGroupDTO toGroupDTO(ProductGroup g, List<ProductGroupItem> items){
        var dto = new ProductGroupDTO();
        dto.setId(g.getId());
        dto.setTitle(g.getTitle());
        dto.setVariant(g.getVariant());
        dto.setProducts(items.stream()
                .map(ProductGroupItem::getProduct)
                .map(p -> {
                    var pl = new ProductLiteDTO();
                    pl.setId(p.getId());
                    // en modelo es "image", en DTO exponemos "imageUrl"
                    pl.setImageUrl(p.getImage());
                    return pl;
                })
                .toList());
        return dto;
    }
}
