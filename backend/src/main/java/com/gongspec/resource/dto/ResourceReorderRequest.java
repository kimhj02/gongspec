package com.gongspec.resource.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record ResourceReorderRequest(@NotEmpty List<UUID> ids) {}
