package com.exam.backend.Controller.Admin;

import com.exam.backend.DTO.SectionDTO;
import com.exam.backend.Model.Audience;
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

    /* Payload explícito para crear/editar (evita pisar campos con nulls) */
    public static class SectionPayload {
        public String name;
        public String slug;           // solo se usa en POST; en PUT se respeta el actual si viene null/blank
        public Integer orderIndex;
        public Boolean enabled;
        public String audience;       // "ALL" | "RESIDENT" | "TOURIST" (case-insensitive)
    }

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
    public ResponseEntity<?> create(@Valid @RequestBody SectionPayload body){
        try {
            Section s = new Section();
            s.setName(body.name);
            s.setSlug(body.slug); // en POST es obligatorio
            s.setOrderIndex(body.orderIndex == null ? 0 : body.orderIndex);
            s.setEnabled(body.enabled == null ? true : body.enabled);
            s.setAudience(parseAudience(body.audience)); // robusto
            return ResponseEntity.ok(Mapper.toSectionDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody SectionPayload body){
        Optional<Section> o = repo.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();
        Section s = o.get();

        // name
        if (body.name != null) s.setName(body.name);

        // slug: NO lo pisamos si viene null o blank
        if (body.slug != null && !body.slug.isBlank()) {
            s.setSlug(body.slug);
        }

        // order
        if (body.orderIndex != null) s.setOrderIndex(body.orderIndex);

        // enabled: si viene null, mantenemos el valor actual
        if (body.enabled != null) {
            s.setEnabled(body.enabled);
        }

        // audience (robusto). Si viene null/blank/ inválido, dejamos la actual
        Audience aud = tryParseAudienceOrNull(body.audience);
        if (aud != null) s.setAudience(aud);

        try {
            return ResponseEntity.ok(Mapper.toSectionDTO(repo.save(s)));
        } catch (DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","unique-violation"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        try {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (org.springframework.dao.DataIntegrityViolationException e){
            return ResponseEntity.status(409).body(java.util.Map.of("error","in-use"));
        }
    }

    // ---------- helpers ----------
    private Audience parseAudience(String raw){
        Audience a = tryParseAudienceOrNull(raw);
        return a == null ? Audience.ALL : a;
    }

    private Audience tryParseAudienceOrNull(String raw){
        if (raw == null) return null;
        String v = raw.trim().toUpperCase();
        if (v.isEmpty()) return null;
        if (v.equals("ALL")) return Audience.ALL;
        if (v.equals("RESIDENT")) return Audience.RESIDENT;
        if (v.equals("TOURIST")) return Audience.TOURIST;
        return null; // inválido
    }
}
