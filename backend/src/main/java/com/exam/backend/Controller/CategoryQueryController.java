package com.exam.backend.Controller;

import com.exam.backend.DTO.CategoryDTO;
import com.exam.backend.Model.Category;
import com.exam.backend.Repository.CategoryRepository;
import com.exam.backend.Service.Mapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryQueryController {

    private final CategoryRepository categoryRepository;

    public CategoryQueryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<CategoryDTO> list() {
        return categoryRepository.findAll().stream().map(Mapper::toCategoryDTO).collect(Collectors.toList());
    }
}
