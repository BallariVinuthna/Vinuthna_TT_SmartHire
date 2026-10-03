# ==============================================================================
# SmartHire Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build React Frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY smart-hire-frontend/package*.json ./
RUN npm ci
COPY smart-hire-frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Build Spring Boot Backend (Java 21)
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY smart-hire-backend/pom.xml .
COPY smart-hire-backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests
RUN cp target/smart-hire-backend-*.jar target/app.jar

# Stage 3: Lightweight Production Runtime Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=backend-build /app/target/app.jar app.jar
EXPOSE 8080
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
