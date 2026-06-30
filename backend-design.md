# Diseño de Arquitectura del Backend (.NET Core + Clean Architecture)

Este documento detalla la estructura sugerida de carpetas, DTOs y controladores en C# para implementar una API REST robusta que interactúe directamente con el frontend de A-Wallet.

---

## 1. Estructura de Capas de la Solución (Clean Architecture)

Se recomienda estructurar la solución en 4 proyectos separados para mantener el aislamiento de responsabilidades:

```
AWallet.Solution/
│
├── AWallet.sln                     # Solución global de Visual Studio
│
├── src/
│   ├── AWallet.Domain/             # Capa del Dominio (No tiene dependencias de infraestructura)
│   │   ├── Entities/
│   │   │   ├── Usuario.cs
│   │   │   └── Cuenta.cs
│   │   ├── Enums/
│   │   │   └── EstadoCuenta.cs
│   │   └── Interfaces/
│   │       ├── IUsuarioRepository.cs
│   │       └── ICuentaRepository.cs
│   │
│   ├── AWallet.Application/        # Capa de Aplicación (Contiene lógica de negocio y DTOs)
│   │   ├── DTOs/
│   │   │   ├── RegisterRequestDto.cs
│   │   │   ├── LoginRequestDto.cs
│   │   │   ├── AuthResponseDto.cs
│   │   │   ├── BalanceResponseDto.cs
│   │   │   └── TransferRequestDto.cs
│   │   ├── Services/
│   │   │   ├── IAuthService.cs
│   │   │   └── IWalletService.cs
│   │   └── UseCases/ (Opcional si usa CQRS / MediatR)
│   │
│   ├── AWallet.Infrastructure/     # Capa de Infraestructura (EF Core, Migraciones, Proveedores Externos)
│   │   ├── Data/
│   │   │   ├── AWalletDbContext.cs
│   │   │   └── Repositories/
│   │   ├── Security/
│   │   │   └── PasswordHasher.cs   # Cifrado / Hash de PIN
│   │   └── Blockchain/
│   │       └── BlockchainClient.cs # Integración con nodos cripto RPC
│   │
│   └── AWallet.WebAPI/             # Capa de Presentación (Controladores de ASP.NET Core)
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── AccountsController.cs
│       │   └── TransactionsController.cs
│       ├── Middlewares/
│       │   └── ExceptionHandlingMiddleware.cs
│       └── Program.cs              # Configuración y contenedor de dependencias (IoC)
```

---

## 2. Contratos / DTOs Sugeridos (C#)

Para asegurar la correcta serialización, el backend debe estar configurado para usar nomenclatura **camelCase** en JSON (configuración por defecto de ASP.NET Core con `System.Text.Json`), de tal modo que las propiedades correspondan con los interfaces de TypeScript en el cliente.

### DTOs de Autenticación (`Auth DTOs`)
```csharp
namespace AWallet.Application.DTOs
{
    // POST /api/auth/register
    public record RegisterRequestDto(
        string Username, 
        string Pin, 
        Dictionary<string, string> Addresses
    );

    // POST /api/auth/login
    public record LoginRequestDto(
        string Pin
    );

    // Respuesta para Login / Registro
    public record AuthResponseDto(
        string Token, 
        string Username
    );
}
```

### DTOs Financieros y de Administración
```csharp
namespace AWallet.Application.DTOs
{
    // GET /api/accounts/balances
    public record BalanceResponseDto(
        decimal Native, 
        string NativeSymbol, 
        decimal NativeUSD
    );

    // POST /api/transactions/transfer
    public record TransferRequestDto(
        string FromAddress, 
        string ToAddress, 
        decimal Amount, 
        string Network, 
        string Pin
    );

    // POST /api/accounts/block
    public record BlockAccountRequestDto(
        string AccountId, 
        string Pin
    );
}
```

---

## 3. Controladores Limpios y Rutas de Endpoints

### A. AuthController.cs
Maneja el registro inicial (Onboarding) y el desbloqueo de la wallet:
```csharp
using Microsoft.AspNetCore.Mvc;
using AWallet.Application.DTOs;
using AWallet.Application.Services;

namespace AWallet.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
    }
}
```

### B. AccountsController.cs
Maneja la visualización de balances y bloqueos preventivos:
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AWallet.Application.DTOs;
using AWallet.Application.Services;
using System.Security.Claims;

namespace AWallet.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public AccountsController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        [HttpGet("balances")]
        public async Task<IActionResult> GetBalances()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var balances = await _walletService.GetBalancesAsync(Guid.Parse(userId));
            return Ok(balances);
        }

        [HttpPost("block")]
        public async Task<IActionResult> BlockAccount([FromBody] BlockAccountRequestDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var success = await _walletService.BlockAccountAsync(Guid.Parse(userId), dto.AccountId, dto.Pin);
            return Ok(new { success });
        }
    }
}
```

### C. TransactionsController.cs
Maneja el envío de transacciones cripto:
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AWallet.Application.DTOs;
using AWallet.Application.Services;
using System.Security.Claims;

namespace AWallet.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public TransactionsController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequestDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var txHash = await _walletService.ProcessTransferAsync(Guid.Parse(userId), dto);
            return Ok(new { txHash });
        }
    }
}
```
