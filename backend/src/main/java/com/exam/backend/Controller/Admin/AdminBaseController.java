package com.exam.backend.Controller.Admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public abstract class AdminBaseController {
    protected Pageable page(int page, int size, String sort, String dir){
        int p = Math.max(0, page);
        int s = Math.min(Math.max(1, size), 100);
        Sort.Direction d = "asc".equalsIgnoreCase(dir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sortBy = (sort==null || sort.isBlank()) ? Sort.by(d, "id") : Sort.by(d, sort);
        return PageRequest.of(p, s, sortBy);
    }
}
