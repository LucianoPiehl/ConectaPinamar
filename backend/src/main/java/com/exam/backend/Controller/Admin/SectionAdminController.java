package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.SectionDTO;
import com.exam.backend.Model.Section;
import com.exam.backend.Repository.SectionRepository;
import com.exam.backend.Service.Mapper;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/sections")
@CrossOrigin(origins = "*")
public class SectionAdminController extends AdminBaseController {

    private final SectionRepository repo;

    public SectionAdminController(SectionRepository repo) { this.repo = repo; }

    @GetMapping
    public Page<SectionDTO> list(@RequestParam(defaultValue="") String q,
                                 @RequestParam(defaultValue="0") int page,
                                 @RequestParam(defaultValue="10") int size,
                                 @RequestParam(required=false) String sort,
                                 @RequestParam(defaultValue="desc") String dir) {
        var pageable = page(page, size, sort, dir);
        Page<Section> result = (q==null || q.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNameContainingIgnoreCase(q, pageable);
        return result.map(Mapper::toSectionDTO);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Section body){
        try {
            Section s = new Section();
            s.setName(body.getName());
            s.setSlug(body.getSlug());
            s.setOrderIndex(body.getOrderIndex()==null?0:body.getOrderIndex());
            s.setEnabled(body.getEnabled()==null?true:body.getEnabled());
            return ResponseEntity.ok(Mapper.toSectionDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Section body){
        Optional<Section> o = repo.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();
        Section s = o.get();
        s.setName(body.getName());
        s.setSlug(body.getSlug());
        s.setOrderIndex(body.getOrderIndex()==null?0:body.getOrderIndex());
        s.setEnabled(body.getEnabled()==null?true:body.getEnabled());
        try {
            return ResponseEntity.ok(Mapper.toSectionDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        try {
            repo.deleteById(id); // si preferís bloqueo cuando hay grupos, avisá y lo añadimos
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","in-use"));
        }
    }
}
