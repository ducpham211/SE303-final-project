package com.example.backend.config;

import org.hibernate.dialect.PostgreSQLDialect;

public class CustomPostgreSQLDialect extends PostgreSQLDialect {

    @Override
    public boolean useArrayForMultiValuedParameters() {
        return false;
    }
}
