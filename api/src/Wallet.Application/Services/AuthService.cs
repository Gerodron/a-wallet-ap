using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Wallet.Domain.Entities;
using Wallet.Domain.Interfaces;
using Wallet.Application.DTOs;

using Microsoft.Extensions.Logging;

namespace Wallet.Application.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
        {
            var existing = await _unitOfWork.Usuarios.GetByUsernameAsync(dto.Username);
            if (existing != null)
            {
                throw new Exception("El nombre de usuario ya está registrado.");
            }

            var pinHash = HashPin(dto.Pin);
            var usuario = new Usuario
            {
                NombreUsuario = dto.Username,
                PinHash = pinHash
            };

            await _unitOfWork.Usuarios.AddAsync(usuario);

            // Register accounts/addresses derived
            foreach (var kvp in dto.Addresses)
            {
                var cuenta = new Cuenta
                {
                    UsuarioId = usuario.UsuarioId,
                    DireccionPublica = kvp.Value,
                    Red = kvp.Key,
                    SaldoNativo = kvp.Key == "solana" ? 25.425m : kvp.Key == "bitcoin" ? 0.0842m : 4.150m,
                    SaldoUsd = (kvp.Key == "solana" ? 25.425m : kvp.Key == "bitcoin" ? 0.0842m : 4.150m) 
                               * (kvp.Key == "solana" ? 140m : kvp.Key == "bitcoin" ? 68000m : 580m)
                };
                await _unitOfWork.Cuentas.AddAsync(cuenta);
            }

            await _unitOfWork.CompleteAsync();

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDto
            {
                Token = token,
                Username = usuario.NombreUsuario
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
        {
            // For simplified demo, retrieve first user or validate hash matching
            // Since pin is local, we check the PIN hash
            var hash = HashPin(dto.Pin);
            
            // Try to find the demo user or validate based on PIN mock
            Usuario? usuario = null;
            if (dto.Pin == "123456")
            {
                usuario = await _unitOfWork.Usuarios.GetByUsernameAsync("demo_user");
                if (usuario == null)
                {
                    // Seed demo user dynamically if missing
                    usuario = new Usuario
                    {
                        NombreUsuario = "demo_user",
                        PinHash = hash
                    };
                    await _unitOfWork.Usuarios.AddAsync(usuario);
                    
                    // Add standard demo accounts
                    var addresses = new[] {
                        new { Address = "7xKX3G8xYJz1v2w3...sol", Network = "solana", Val = 25.425m },
                        new { Address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", Network = "bitcoin", Val = 0.0842m },
                        new { Address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", Network = "bnb", Val = 4.150m }
                    };

                    foreach (var addr in addresses)
                    {
                        await _unitOfWork.Cuentas.AddAsync(new Cuenta
                        {
                            UsuarioId = usuario.UsuarioId,
                            DireccionPublica = addr.Address,
                            Red = addr.Network,
                            SaldoNativo = addr.Val,
                            SaldoUsd = addr.Val * (addr.Network == "solana" ? 140m : addr.Network == "bitcoin" ? 68000m : 580m)
                        });
                    }
                    await _unitOfWork.CompleteAsync();
                }
            }
            else
            {
                _logger.LogWarning("[Seguridad - Auditoría] Intento fallido de acceso local detectado. Se ha denegado la generación del token JWT por PIN incorrecto.");
                throw new Exception("PIN incorrecto. Pruebe con '123456'.");
            }

            usuario.UltimoAcceso = DateTime.UtcNow;
            _unitOfWork.Usuarios.Update(usuario);
            await _unitOfWork.CompleteAsync();

            var token = GenerateJwtToken(usuario);

            return new AuthResponseDto
            {
                Token = token,
                Username = usuario.NombreUsuario
            };
        }

        private string HashPin(string pin)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(pin));
            return Convert.ToHexString(bytes);
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "SUPER_SECRET_KEY_FOR_AWALLET_123456789";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, usuario.NombreUsuario),
                new Claim(ClaimTypes.NameIdentifier, usuario.UsuarioId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "AWalletAPI",
                audience: _configuration["Jwt:Audience"] ?? "AWalletClient",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
