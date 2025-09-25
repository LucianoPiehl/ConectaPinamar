package com.exam.backend.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.exam.backend.DTO.*;
import com.exam.backend.Model.*;

public class Mapper {

    public static CategoryDTO toCategoryDTO(Category c){
        CategoryDTO dto = new CategoryDTO();
        dto.id = c.getId();
        dto.name = c.getName();
        dto.description = c.getDescription();
        dto.imageUrl = c.getImageUrl();
        dto.imageBanner = c.getImageBanner(); // ⬅️ NUEVO

        return dto;
    }

    public static SellerMiniDTO toSellerMiniDTO(Seller s){
        if (s == null) return null;
        SellerMiniDTO dto = new SellerMiniDTO();
        dto.id = s.getId();
        dto.name = s.getName();
        dto.imageUrl = s.getImageUrl();
        return dto;
    }

    public static SellerDTO toSellerDTO(Seller s){
        if (s == null) return null;
        SellerDTO dto = new SellerDTO();
        dto.id = s.getId();
        dto.name = s.getName();
        dto.description = s.getDescription();
        dto.location = s.getLocation();
        dto.contactPhone = s.getContactPhone();
        dto.contactEmail = s.getContactEmail();
        dto.imageUrl = s.getImageUrl();
        dto.visitCount = s.getVisitCount();
        return dto;
    }

    public static ProductDTO toProductDTO(Product p){
        ProductDTO dto = new ProductDTO();
        dto.id = p.getId();
        dto.name = p.getName();
        dto.description = p.getDescription();
        dto.imageUrl = p.getImage();
        dto.price = p.getPrice();
        dto.seller = toSellerMiniDTO(p.getSeller());
        if (p.getCategories() != null) {
            dto.categories = p.getCategories().stream().map(Mapper::toCategoryDTO).collect(Collectors.toList());
        }
        return dto;
    }
    public static ProductLiteDTO toProductLite(Product p){
        // ¡clave!: imageUrl del DTO sale de Product.image
        return new ProductLiteDTO(p.getId(), p.getImage());
    }

    public static ProductGroupDTO toProductGroupDTO(ProductGroup g, List<ProductGroupItem> items){
        ProductGroupDTO dto = new ProductGroupDTO();
        dto.setId(g.getId());
        dto.setTitle(g.getTitle());
        dto.setVariant(g.getVariant());
        dto.setProducts(
                items.stream()
                        .sorted(Comparator.comparingInt(ProductGroupItem::getPosition))
                        .map(i -> toProductLite(i.getProduct()))
                        .toList()
        );
        return dto;
    }

    public static SectionDTO toSectionDTO(Section s){
        SectionDTO d = new SectionDTO();
        d.id = s.getId();
        d.name = s.getName();
        d.slug = s.getSlug();
        d.orderIndex = s.getOrderIndex();
        d.enabled = s.getEnabled();
        return d;
    }
}
