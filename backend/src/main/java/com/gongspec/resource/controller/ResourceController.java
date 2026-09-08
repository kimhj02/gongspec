package com.gongspec.resource.controller;

import com.gongspec.auth.CurrentUser;
import com.gongspec.resource.dto.ResourceCreateRequest;
import com.gongspec.resource.dto.ResourceResponse;
import com.gongspec.resource.dto.ResourceUpdateRequest;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.resource.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<ResourceResponse> list(
            @RequestParam(required = false) ResourceTab tab, @RequestParam(required = false) String query) {
        return resourceService.list(CurrentUser.id(), tab, query).stream()
                .map(ResourceResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceResponse create(@Valid @RequestBody ResourceCreateRequest request) {
        return ResourceResponse.from(resourceService.create(CurrentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResourceResponse update(@PathVariable UUID id, @RequestBody ResourceUpdateRequest request) {
        return ResourceResponse.from(resourceService.update(CurrentUser.id(), id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        resourceService.delete(CurrentUser.id(), id);
    }
}
