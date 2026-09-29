package com.gongspec.resource.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

/** 화면에서 지정한 자료 ID 순서를 받는다. 중복·소유권·자료 유형은 서비스에서 확인한다. */
public record ResourceReorderRequest(@NotEmpty List<UUID> ids) {}
