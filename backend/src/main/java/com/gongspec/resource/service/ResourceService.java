package com.gongspec.resource.service;

import com.gongspec.application.entity.JobApplication;
import com.gongspec.application.repository.JobApplicationRepository;
import com.gongspec.career.entity.Career;
import com.gongspec.career.repository.CareerRepository;
import com.gongspec.certificate.entity.Certificate;
import com.gongspec.certificate.repository.CertificateRepository;
import com.gongspec.common.exception.ApiException;
import com.gongspec.education.entity.Education;
import com.gongspec.education.repository.EducationRepository;
import com.gongspec.essay.entity.Essay;
import com.gongspec.essay.repository.EssayRepository;
import com.gongspec.memo.entity.Memo;
import com.gongspec.memo.repository.MemoRepository;
import com.gongspec.resource.dto.ResourceCreateRequest;
import com.gongspec.resource.dto.ResourceUpdateRequest;
import com.gongspec.resource.entity.ResourceItem;
import com.gongspec.resource.entity.ResourceTab;
import com.gongspec.site.entity.Site;
import com.gongspec.site.repository.SiteRepository;
import com.gongspec.training.entity.Training;
import com.gongspec.training.repository.TrainingRepository;
import com.gongspec.user.entity.User;
import com.gongspec.user.service.UserService;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ResourceService {

    private final UserService userService;
    private final CertificateRepository certificateRepository;
    private final EducationRepository educationRepository;
    private final TrainingRepository trainingRepository;
    private final CareerRepository careerRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EssayRepository essayRepository;
    private final MemoRepository memoRepository;
    private final SiteRepository siteRepository;

    public ResourceService(
            UserService userService,
            CertificateRepository certificateRepository,
            EducationRepository educationRepository,
            TrainingRepository trainingRepository,
            CareerRepository careerRepository,
            JobApplicationRepository jobApplicationRepository,
            EssayRepository essayRepository,
            MemoRepository memoRepository,
            SiteRepository siteRepository) {
        this.userService = userService;
        this.certificateRepository = certificateRepository;
        this.educationRepository = educationRepository;
        this.trainingRepository = trainingRepository;
        this.careerRepository = careerRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.essayRepository = essayRepository;
        this.memoRepository = memoRepository;
        this.siteRepository = siteRepository;
    }

    public List<ResourceItem> list(UUID userId, ResourceTab tab, String query) {
        List<ResourceItem> items = tab == null ? listAll(userId) : sorted(listByTab(userId, tab));
        return items.stream().filter(item -> item.matchesQuery(query)).toList();
    }

    @Transactional
    public ResourceItem create(UUID userId, ResourceCreateRequest request) {
        User user = userService.getById(userId);
        ResourceItem item = newItem(user, request.tab(), request.title());
        item.setSortOrder(nextSortOrder(listByTab(userId, request.tab())));
        apply(item, request.title(), request.subtitle(), request.body(), request.tags(), request.date(), request.pinned(), request.collapsed(), request.details());
        return save(item);
    }

    @Transactional
    public ResourceItem update(UUID userId, UUID id, ResourceUpdateRequest request) {
        ResourceItem item = getOwned(userId, id);
        apply(item, request.title(), request.subtitle(), request.body(), request.tags(), request.date(), request.pinned(), request.collapsed(), request.details());
        return item;
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        deleteItem(getOwned(userId, id));
    }

    @Transactional
    public void reorder(UUID userId, List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            throw ApiException.badRequest("순서가 올바르지 않습니다.");
        }
        Set<UUID> unique = new LinkedHashSet<>(ids);
        if (unique.size() != ids.size()) {
            throw ApiException.badRequest("순서가 올바르지 않습니다.");
        }
        ResourceItem first = getOwned(userId, ids.getFirst());
        List<ResourceItem> all = sorted(listByTab(userId, first.getTab()));
        Map<UUID, ResourceItem> byId = new LinkedHashMap<>();
        for (ResourceItem item : all) {
            byId.put(item.getId(), item);
        }
        for (UUID id : ids) {
            if (!byId.containsKey(id)) {
                throw ApiException.badRequest("순서가 올바르지 않습니다.");
            }
        }
        Deque<UUID> queue = new ArrayDeque<>(ids);
        List<ResourceItem> next = new ArrayList<>(all.size());
        for (ResourceItem item : all) {
            if (unique.contains(item.getId())) {
                next.add(byId.get(queue.removeFirst()));
            } else {
                next.add(item);
            }
        }
        for (int index = 0; index < next.size(); index++) {
            next.get(index).setSortOrder(index);
        }
    }

    private List<ResourceItem> listAll(UUID userId) {
        List<ResourceItem> items = new ArrayList<>();
        items.addAll(sorted(certificateRepository.findByUserId(userId)));
        items.addAll(sorted(educationRepository.findByUserId(userId)));
        items.addAll(sorted(trainingRepository.findByUserId(userId)));
        items.addAll(sorted(careerRepository.findByUserId(userId)));
        items.addAll(sorted(jobApplicationRepository.findByUserId(userId)));
        items.addAll(sorted(essayRepository.findByUserId(userId)));
        items.addAll(sorted(memoRepository.findByUserId(userId)));
        items.addAll(sorted(siteRepository.findByUserId(userId)));
        return items;
    }

    private List<? extends ResourceItem> listByTab(UUID userId, ResourceTab tab) {
        return switch (tab) {
            case certificate -> certificateRepository.findByUserId(userId);
            case education -> educationRepository.findByUserId(userId);
            case training -> trainingRepository.findByUserId(userId);
            case career -> careerRepository.findByUserId(userId);
            case applications -> jobApplicationRepository.findByUserId(userId);
            case essays -> essayRepository.findByUserId(userId);
            case memo -> memoRepository.findByUserId(userId);
            case sites -> siteRepository.findByUserId(userId);
        };
    }

    private static List<ResourceItem> sorted(List<? extends ResourceItem> items) {
        return items.stream()
                .sorted(Comparator.comparingInt(ResourceItem::getSortOrder)
                        .thenComparing(ResourceItem::isPinned, Comparator.reverseOrder())
                        .thenComparing(ResourceItem::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(item -> item.getId().toString()))
                .map(ResourceItem.class::cast)
                .toList();
    }

    private static int nextSortOrder(List<? extends ResourceItem> items) {
        return items.stream().mapToInt(ResourceItem::getSortOrder).min().orElse(1) - 1;
    }

    private ResourceItem newItem(User user, ResourceTab tab, String title) {
        return switch (tab) {
            case certificate -> new Certificate(user, title);
            case education -> new Education(user, title);
            case training -> new Training(user, title);
            case career -> new Career(user, title);
            case applications -> new JobApplication(user, title);
            case essays -> new Essay(user, title);
            case memo -> new Memo(user, title);
            case sites -> new Site(user, title);
        };
    }

    private ResourceItem save(ResourceItem item) {
        return switch (item.getTab()) {
            case certificate -> certificateRepository.save((Certificate) item);
            case education -> educationRepository.save((Education) item);
            case training -> trainingRepository.save((Training) item);
            case career -> careerRepository.save((Career) item);
            case applications -> jobApplicationRepository.save((JobApplication) item);
            case essays -> essayRepository.save((Essay) item);
            case memo -> memoRepository.save((Memo) item);
            case sites -> siteRepository.save((Site) item);
        };
    }

    private void deleteItem(ResourceItem item) {
        switch (item.getTab()) {
            case certificate -> certificateRepository.delete((Certificate) item);
            case education -> educationRepository.delete((Education) item);
            case training -> trainingRepository.delete((Training) item);
            case career -> careerRepository.delete((Career) item);
            case applications -> jobApplicationRepository.delete((JobApplication) item);
            case essays -> essayRepository.delete((Essay) item);
            case memo -> memoRepository.delete((Memo) item);
            case sites -> siteRepository.delete((Site) item);
        }
    }

    private ResourceItem getOwned(UUID userId, UUID id) {
        return findOwned(userId, id).orElseThrow(() -> ApiException.notFound("자료를 찾을 수 없습니다."));
    }

    private Optional<ResourceItem> findOwned(UUID userId, UUID id) {
        return first(
                certificateRepository.findByIdAndUserId(id, userId),
                educationRepository.findByIdAndUserId(id, userId),
                trainingRepository.findByIdAndUserId(id, userId),
                careerRepository.findByIdAndUserId(id, userId),
                jobApplicationRepository.findByIdAndUserId(id, userId),
                essayRepository.findByIdAndUserId(id, userId),
                memoRepository.findByIdAndUserId(id, userId),
                siteRepository.findByIdAndUserId(id, userId));
    }

    @SafeVarargs
    private static Optional<ResourceItem> first(Optional<? extends ResourceItem>... options) {
        for (Optional<? extends ResourceItem> option : options) {
            if (option.isPresent()) {
                return Optional.of(option.get());
            }
        }
        return Optional.empty();
    }

    private static void apply(
            ResourceItem item,
            String title,
            String subtitle,
            String body,
            java.util.List<String> tags,
            String date,
            Boolean pinned,
            Boolean collapsed,
            java.util.Map<String, String> details) {
        item.merge(title, subtitle, body, tags, date, pinned, collapsed, details);
    }
}
