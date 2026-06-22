FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /app

# Copy solution and restore projects
COPY Wallet.slnx ./
COPY api/src/Wallet.API/Wallet.API.csproj api/src/Wallet.API/

# Restore dependencies
RUN dotnet restore api/src/Wallet.API/Wallet.API.csproj

# Copy source
COPY api/src/Wallet.API/ api/src/Wallet.API/
WORKDIR /app/api/src/Wallet.API

# Publish (disable fallback path configurations explicitly via configuration file setting)
RUN dotnet publish -c Release -o /app/out --no-restore --configfile /app/Wallet.slnx
 
# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
COPY --from=build /app/out ./

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Wallet.API.dll"]
