# ==============================================================================
# SmartHire Backend Production Dockerfile (Spring Boot 3 / Java 21)
# ==============================================================================

# Stage 1: Build Spring Boot Application with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests
RUN cp target/smart-hire-backend-*.jar target/app.jar

# Stage 2: Lightweight Production Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl && mkdir -p /app/data

COPY --from=build /app/target/app.jar app.jar

EXPOSE 8080
ENV PORT=8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
