# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to cache them using BuildKit cache mounts
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -B
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn package -DskipTests


# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
