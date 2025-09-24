package com.exam.backend.Controller.Admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "empty-file"));

        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);

        String ext = "";
        String fn = StringUtils.cleanPath(file.getOriginalFilename()==null? "file" : file.getOriginalFilename());
        int dot = fn.lastIndexOf('.');
        if (dot >= 0) ext = fn.substring(dot);
        String stored = UUID.randomUUID().toString().replace("-", "") + ext.toLowerCase();

        Path target = dir.resolve(stored);
        Files.copy(file.getInputStream(), target);

        String url = "/uploads/" + stored;
        return ResponseEntity.ok(Map.of("url", url, "filename", stored, "size", file.getSize(), "contentType", file.getContentType()));
    }
}
