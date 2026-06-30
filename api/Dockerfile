FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /app

# Copy solution and all project files to restore dependencies
COPY Wallet.slnx ./
COPY api/src/Wallet.API/Wallet.API.csproj api/src/Wallet.API/
COPY api/src/Wallet.Domain/Wallet.Domain.csproj api/src/Wallet.Domain/
COPY api/src/Wallet.Application/Wallet.Application.csproj api/src/Wallet.Application/
COPY api/src/Wallet.Infrastructure/Wallet.Infrastructure.csproj api/src/Wallet.Infrastructure/

# Restore dependencies
RUN --mount=type=cache,target=/root/.nuget/packages dotnet restore api/src/Wallet.API/Wallet.API.csproj

# Copy all source files
COPY api/src/ api/src/
WORKDIR /app/api/src/Wallet.API

# Publish
RUN --mount=type=cache,target=/root/.nuget/packages dotnet publish -c Release -o /app/out --no-restore
 
# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Install ICU libraries for SqlClient globalization support
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/out ./

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Wallet.API.dll"]
