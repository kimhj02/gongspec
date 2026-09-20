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
        ColumnSpec spec = jdbc.query(
                """
                SELECT DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT, CHARACTER_SET_NAME, COLLATION_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """,
                rs -> {
                    if (!rs.next()) {
                        return null;
                    }
                    return new ColumnSpec(
                            rs.getString("DATA_TYPE"),
                            "YES".equalsIgnoreCase(rs.getString("IS_NULLABLE")),
                            rs.getString("COLUMN_DEFAULT"),
                            rs.getString("COLUMN_COMMENT"),
                            rs.getString("CHARACTER_SET_NAME"),
                            rs.getString("COLLATION_NAME"));
                },
                table,
                column);
        if (spec == null || !shouldWiden(spec.dataType())) {
            return;
        }
        jdbc.execute(alterToTextSql(table, column, spec));
        log.info("Widened {}.{} from {} to TEXT", table, column, spec.dataType());
    }

    static boolean shouldWiden(String dataType) {
        if (dataType == null || dataType.isBlank()) {
            return false;
        }
        return switch (dataType.toLowerCase()) {
            case "varchar", "char", "tinytext" -> true;
            default -> false;
        };
    }

    static String alterToTextSql(String table, String column, ColumnSpec spec) {
        StringBuilder sql = new StringBuilder()
                .append("ALTER TABLE `")
                .append(table)
                .append("` MODIFY `")
                .append(column)
                .append("` TEXT");
        if (isSafeIdent(spec.charset())) {
            sql.append(" CHARACTER SET ").append(spec.charset());
        }
        if (isSafeIdent(spec.collation())) {
            sql.append(" COLLATE ").append(spec.collation());
        }
        sql.append(spec.nullable() ? " NULL" : " NOT NULL");
        if (spec.columnDefault() != null) {
            sql.append(" DEFAULT ").append(sqlString(spec.columnDefault()));
        }
        if (spec.comment() != null && !spec.comment().isBlank()) {
            sql.append(" COMMENT ").append(sqlString(spec.comment()));
        }
        return sql.toString();
    }

    private static boolean isSafeIdent(String value) {
        return value != null && value.matches("[A-Za-z0-9_]+");
    }

    private static String sqlString(String value) {
        return "'" + value.replace("'", "''") + "'";
    }

    record ColumnSpec(
            String dataType,
            boolean nullable,
            String columnDefault,
            String comment,
            String charset,
            String collation) {}
}
