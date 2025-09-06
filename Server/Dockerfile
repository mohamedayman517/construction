# Use the official .NET 8.0 runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the official .NET 8.0 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["ConstructionMarketplace.csproj", "."]
RUN dotnet restore "./ConstructionMarketplace.csproj"

# Copy all source files
COPY . .
WORKDIR "/src/."

# Build the application
RUN dotnet build "ConstructionMarketplace.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "ConstructionMarketplace.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage - runtime image
FROM base AS final
WORKDIR /app

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/wwwroot/uploads

# Copy published application
COPY --from=publish /app/publish .

# Set permissions for logs and uploads directories
RUN chmod 755 /app/logs /app/wwwroot/uploads

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "ConstructionMarketplace.dll"]

