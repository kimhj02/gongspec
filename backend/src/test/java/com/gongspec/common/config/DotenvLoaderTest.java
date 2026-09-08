package com.gongspec.common.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class DotenvLoaderTest {

    @Test
    void parsesKeysAndIgnoresCommentsAndBlanks() {
        var values = DotenvLoader.parse(List.of(
                "# comment",
                "",
                "KAKAO_CLIENT_ID=rest-key",
                "KAKAO_CLIENT_SECRET=\"secret-value\"",
                "KAKAO_CLIENT_ID=ignored-duplicate",
                "EMPTY=",
                "BROKEN"));

        assertThat(values)
                .containsEntry("KAKAO_CLIENT_ID", "rest-key")
                .containsEntry("KAKAO_CLIENT_SECRET", "secret-value")
                .doesNotContainKey("EMPTY");
    }

    @Test
    void prefersEnvFileInWorkingDirectory(@TempDir Path tempDir) throws Exception {
        Files.writeString(tempDir.resolve(".env"), "KAKAO_CLIENT_ID=cwd-key\n");

        Path found = DotenvLoader.resolveFile(tempDir);

        assertThat(found).isEqualTo(tempDir.resolve(".env"));
        assertThat(DotenvLoader.load(found)).containsEntry("KAKAO_CLIENT_ID", "cwd-key");
    }

    @Test
    void fallsBackToParentEnvFile(@TempDir Path tempDir) throws Exception {
        Files.writeString(tempDir.resolve(".env"), "KAKAO_CLIENT_ID=root-key\n");
        Path backend = Files.createDirectory(tempDir.resolve("backend"));

        Path found = DotenvLoader.resolveFile(backend);

        assertThat(found).isEqualTo(tempDir.resolve(".env"));
    }
}
