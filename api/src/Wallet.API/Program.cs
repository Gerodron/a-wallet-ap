using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Wallet.Domain.Interfaces;
using Wallet.Infrastructure.Data;
using Wallet.Infrastructure.Data.Repositories;
using Wallet.Application.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add SQL Server Connection context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("Wallet.Infrastructure")));

// 2. Add JWT Bearer Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_FOR_AWALLET_123456789";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AWalletAPI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AWalletClient",
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});

// 3. Register Repository and UnitOfWork DI
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<ICuentaRepository, CuentaRepository>();
builder.Services.AddScoped<ITransaccionRepository, TransaccionRepository>();

// 4. Register Services DI
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CuentaService>();
builder.Services.AddScoped<TransaccionService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS to allow frontend communication
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Ensure Database and Schema are created dynamically at startup with retries
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var retries = 6;
        while (retries > 0)
        {
            try
            {
                logger.LogInformation("Intentando conectar y verificar la base de datos SQL Server...");
                context.Database.EnsureCreated();
                logger.LogInformation("Base de datos y tablas creadas/verificadas exitosamente en SQL Server.");
                break;
            }
            catch (Exception ex)
            {
                retries--;
                if (retries == 0)
                {
                    logger.LogError(ex, "No se pudo conectar a SQL Server tras varios intentos.");
                    throw;
                }
                logger.LogWarning($"SQL Server no está listo. Reintentando en 5 segundos... (Intentos restantes: {retries})");
                System.Threading.Thread.Sleep(5000);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Ocurrió un error crítico durante la inicialización de la base de datos.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
