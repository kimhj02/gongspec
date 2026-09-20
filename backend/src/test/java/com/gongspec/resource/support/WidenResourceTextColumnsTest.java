package com.gongspec.resource.support;

import static org.assertj.core.api.Assertions.assertThat;

import com.gongspec.resource.support.WidenResourceTextColumns.ColumnSpec;
import org.junit.jupiter.api.Test;

class WidenResourceTextColumnsTest {

    @Test
    void widensAnyVarcharRegardlessOfLength() {
        assertThat(WidenResourceTextColumns.shouldWiden("varchar")).isTrue();
        assertThat(WidenResourceTextColumns.shouldWiden("VARCHAR")).isTrue();
        assertThat(WidenResourceTextColumns.shouldWiden("char")).isTrue();
        assertThat(WidenResourceTextColumns.shouldWiden("tinytext")).isTrue();
        assertThat(WidenResourceTextColumns.shouldWiden("text")).isFalse();
        assertThat(WidenResourceTextColumns.shouldWiden("mediumtext")).isFalse();
        assertThat(WidenResourceTextColumns.shouldWiden("longtext")).isFalse();
    }

    @Test
    void keepsNullabilityCharsetCollationAndComment() {
        ColumnSpec spec = new ColumnSpec("varchar", true, null, "부제", "utf8mb4", "utf8mb4_unicode_ci");
        assertThat(WidenResourceTextColumns.alterToTextSql("essays", "subtitle", spec))
                .isEqualTo(
                        "ALTER TABLE `essays` MODIFY `subtitle` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '부제'");
    }

    @Test
    void keepsNotNullAndDefault() {
        ColumnSpec spec = new ColumnSpec("varchar", false, "", null, "utf8mb4", "utf8mb4_unicode_ci");
        assertThat(WidenResourceTextColumns.alterToTextSql("essays", "item", spec))
                .isEqualTo(
                        "ALTER TABLE `essays` MODIFY `item` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''");
    }
}
