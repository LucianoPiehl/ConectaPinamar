package com.exam.backend.DTO;

import com.exam.backend.Model.Audience;

public class SectionDTO {
    public Long id;
    public String name;
    public String slug;
    public Integer orderIndex;
    public Boolean enabled;
    public Audience audience; // NUEVO
}
