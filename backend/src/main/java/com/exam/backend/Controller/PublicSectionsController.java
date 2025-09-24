package com.exam.backend.Controller;

import com.exam.backend.DTO.ProductGroupDTO;
import com.exam.backend.DTO.ProductLiteDTO;
import com.exam.backend.DTO.SectionDTO;
import com.exam.backend.Model.ProductGroup;
import com.exam.backend.Model.ProductGroupItem;
import com.exam.backend.Model.Section;
import com.exam.backend.Repository.ProductGroupItemRepository;
import com.exam.backend.Repository.ProductGroupRepository;
import com.exam.backend.Repository.SectionRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping
    public List<SectionDTO> listEnabled() {
        return sectionRepo.findByEnabledTrueOrderByOrderIndexAsc()
                .stream().map(Mapper::toSectionDTO).toList();
    }

    @GetMapping("/{slug}/groups")
    public List<ProductGroupDTO> groupsBySlug(@PathVariable String slug) {
        Optional<Section> sec = sectionRepo.findBySlug(slug);
        if (sec.isEmpty()) {
            // fallback: permitir ID numérico en lugar de slug
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
            // CLAVE: imageUrl sale de Product.image
            pl.setImageUrl(p.getImage());
            return pl;
        }).toList());
        return dto;
    }
}
