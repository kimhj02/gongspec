package com.gongspec.resource.service;

import com.gongspec.common.exception.ApiException;
import com.gongspec.resource.dto.ResourceCreateRequest;
import com.gongspec.resource.dto.ResourceUpdateRequest;
import com.gongspec.resource.entity.Resource;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.resource.repository.ResourceRepository;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserService userService;

    public ResourceService(ResourceRepository resourceRepository, UserService userService) {
        this.resourceRepository = resourceRepository;
        this.userService = userService;
    }

    public List<Resource> list(UUID userId, ResourceTab tab, String query) {
        List<Resource> items = tab == null
                ? resourceRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId)
                : resourceRepository.findByUserIdAndTabOrderByPinnedDescCreatedAtDesc(userId, tab);
        return items.stream().filter(item -> item.matchesQuery(query)).toList();
    }

    @Transactional
    public Resource create(UUID userId, ResourceCreateRequest request) {
        User user = userService.getById(userId);
        Resource resource = new Resource(user, request.tab(), request.title());
        resource.merge(
                request.tab(),
                request.title(),
                request.subtitle(),
                request.body(),
                request.tags(),
                request.date(),
                request.pinned(),
                request.collapsed(),
                request.details());
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource update(UUID userId, UUID id, ResourceUpdateRequest request) {
        Resource resource = getOwned(userId, id);
        resource.merge(
                request.tab(),
                request.title(),
                request.subtitle(),
                request.body(),
                request.tags(),
                request.date(),
                request.pinned(),
                request.collapsed(),
                request.details());
        return resource;
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        resourceRepository.delete(getOwned(userId, id));
    }

    private Resource getOwned(UUID userId, UUID id) {
        return resourceRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("자료를 찾을 수 없습니다."));
    }
}
