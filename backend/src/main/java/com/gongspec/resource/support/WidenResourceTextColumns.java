package com.gongspec.resource.support;

import java.sql.Connection;
import java.util.List;
import java.util.Set;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class WidenResourceTextColumns implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(WidenResourceTextColumns.class);
    private static final List<String> TABLES = List.of(
            "certificates",
            "educations",
            "trainings",
            "careers",
            "projects",
            "applications",
            "essays",
            "memos",
            "sites");
    private static final Set<String> COLUMNS = Set.of("subtitle", "item");

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;

    public WidenResourceTextColumns(DataSource dataSource) {
        this.dataSource = dataSource;
        this.jdbc = new JdbcTemplate(dataSource);
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!isMysql()) {
            return;
        }
        for (String table : TABLES) {
            widenToText(table, "subtitle");
        }
        widenToText("essays", "item");
    }

    private boolean isMysql() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            return "MySQL".equalsIgnoreCase(connection.getMetaData().getDatabaseProductName());
        }
    }

    private void widenToText(String table, String column) {
        if (!TABLES.contains(table) || !COLUMNS.contains(column)) {
            throw new IllegalArgumentException("지원하지 않는 컬럼입니다.");
        }
        Long length = jdbc.query(
                """
                SELECT CHARACTER_MAXIMUM_LENGTH
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """,
                rs -> rs.next() ? rs.getObject(1, Long.class) : null,
                table,
                column);
        if (length == null || length < 0 || length > 255) {
            return;
        }
        jdbc.execute("ALTER TABLE `" + table + "` MODIFY `" + column + "` TEXT");
        log.info("Widened {}.{} from VARCHAR({}) to TEXT", table, column, length);
    }
}
