package com.gongspec.common.config;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    static final String PROPERTY_SOURCE_NAME = "dotenvFile";

    @Override
    public int getOrder() {
        return ConfigDataEnvironmentPostProcessor.ORDER - 1;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path file = DotenvLoader.resolveFile(Path.of(System.getProperty("user.dir", ".")).toAbsolutePath().normalize());
        if (file == null) {
            return;
        }
        try {
            Map<String, Object> properties = new HashMap<>();
            DotenvLoader.load(file).forEach((key, value) -> {
                if (System.getenv(key) == null) {
                    properties.put(key, value);
                }
            });
            if (properties.isEmpty()) {
                return;
            }
            MutablePropertySources sources = environment.getPropertySources();
            MapPropertySource source = new MapPropertySource(PROPERTY_SOURCE_NAME, properties);
            if (sources.contains("systemEnvironment")) {
                sources.addAfter("systemEnvironment", source);
            } else {
                sources.addFirst(source);
            }
        } catch (IOException ignored) {
            // 로컬 .env 가 없어도 서버는 기본 설정으로 기동한다.
        }
    }
}
