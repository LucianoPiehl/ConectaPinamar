package com.exam.backend.Controller;

import com.exam.backend.DTO.ProductGroupDTO;
import com.exam.backend.DTO.ProductLiteDTO;
import com.exam.backend.DTO.SectionDTO;
import com.exam.backend.Model.ProductGroup;
import com.exam.backend.Model.ProductGroupItem;
import com.exam.backend.Model.Section;
import com.exam.backend.Model.Audience;
import com.exam.backend.Repository.ProductGroupItemRepository;
import com.exam.backend.Repository.ProductGroupRepository;
import com.exam.backend.Repository.SectionRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sections")
@CrossOrigin(origins = "*")
public class PublicSectionsController {

    private final SectionRepository sectionRepo;
    private final ProductGroupRepository groupRepo;
    private final ProductGroupItemRepository pgiRepo;

    public PublicSectionsController(SectionRepository sectionRepo,
                                    ProductGroupRepository groupRepo,
                                    ProductGroupItemRepository pgiRepo) {
        this.sectionRepo = sectionRepo;
        this.groupRepo = groupRepo;
        this.pgiRepo = pgiRepo;
    }

    private Audience parseAudienceHeader(HttpServletRequest req){
        String h = req.getHeader("X-Audience");
        if (h == null || h.isBlank()) return Audience.ALL;
        try {
            String v = h.trim().toUpperCase();
            if (v.equals("RESIDENT")) return Audience.RESIDENT;
            if (v.equals("TOURIST")) return Audience.TOURIST;
            if (v.equals("ALL")) return Audience.ALL;
        } catch (Exception ignored){}
        return Audience.ALL;
    }

    private List<Audience> audienceFilterSet(Audience a){
        // Mostrar ALL siempre + la elegida
        if (a == Audience.RESIDENT) return Arrays.asList(Audience.ALL, Audience.RESIDENT);
        if (a == Audience.TOURIST)  return Arrays.asList(Audience.ALL, Audience.TOURIST);
        return Arrays.asList(Audience.ALL);
    }

    @GetMapping
    public List<SectionDTO> listEnabled(HttpServletRequest req) {
        Audience a = parseAudienceHeader(req);
        var list = sectionRepo.findByEnabledTrueAndAudienceInOrderByOrderIndexAsc(audienceFilterSet(a));
        return list.stream().map(Mapper::toSectionDTO).toList();
    }

    // Fallback tolerante: /api/sections/groups?slug=10%25
    @GetMapping("/groups")
    public List<ProductGroupDTO> groupsBySlugQuery(@RequestParam String slug){
        return internalGroupsBySlug(slug);
    }

    @GetMapping("/{slug}/groups")
    public List<ProductGroupDTO> groupsBySlugPath(@PathVariable String slug) {
        return internalGroupsBySlug(slug);
    }

    private List<ProductGroupDTO> internalGroupsBySlug(String slug){
        Optional<Section> sec = sectionRepo.findBySlug(slug);
        if (sec.isEmpty()) {
            try { sec = sectionRepo.findById(Long.valueOf(slug)); } catch (Exception ignored) {}
        }
        if (sec.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        var groups = groupRepo.findBySectionAndEnabledTrueOrderByOrderIndexAsc(sec.get());
        return groups.stream().map(this::toGroupDtoWithItems).toList();
    }

    // ------- helpers -------
    private ProductGroupDTO toGroupDtoWithItems(ProductGroup g){
        var items = pgiRepo.findByGroupOrderByPositionAsc(g); // ordenados
        var dto = new ProductGroupDTO();
        dto.setId(g.getId());
        dto.setTitle(g.getTitle());
        dto.setVariant(g.getVariant());
        dto.setProducts(items.stream().map(ProductGroupItem::getProduct).map(p -> {
            var pl = new ProductLiteDTO();
            pl.setId(p.getId());
            pl.setImageUrl(p.getImage());
            return pl;
        }).toList());
        return dto;
    }
}
