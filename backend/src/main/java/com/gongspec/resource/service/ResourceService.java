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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
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
        List<ResourceItem> items = tab == null ? listAll(userId) : new ArrayList<>(listByTab(userId, tab));
        return items.stream().filter(item -> item.matchesQuery(query)).toList();
    }

    @Transactional
    public ResourceItem create(UUID userId, ResourceCreateRequest request) {
        User user = userService.getById(userId);
        ResourceItem item = newItem(user, request.tab(), request.title());
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

    private List<ResourceItem> listAll(UUID userId) {
        List<ResourceItem> items = new ArrayList<>();
        items.addAll(certificateRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(educationRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(trainingRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(careerRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(jobApplicationRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(essayRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(memoRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.addAll(siteRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId));
        items.sort(Comparator.comparing(ResourceItem::isPinned)
                .reversed()
                .thenComparing(ResourceItem::getCreatedAt, Comparator.reverseOrder()));
        return items;
    }

    private List<? extends ResourceItem> listByTab(UUID userId, ResourceTab tab) {
        return switch (tab) {
            case certificate -> certificateRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case education -> educationRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case training -> trainingRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case career -> careerRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case applications -> jobApplicationRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case essays -> essayRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case memo -> memoRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
            case sites -> siteRepository.findByUserIdOrderByPinnedDescCreatedAtDesc(userId);
        };
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
