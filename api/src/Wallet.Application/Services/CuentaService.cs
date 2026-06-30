using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Wallet.Domain.Interfaces;
using Wallet.Application.DTOs;

namespace Wallet.Application.Services
{
    public class CuentaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CuentaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Dictionary<string, BalanceResponseDto>> GetBalancesAsync(Guid usuarioId)
        {
            var cuentas = await _unitOfWork.Cuentas.GetByUsuarioIdAsync(usuarioId);
            var result = new Dictionary<string, BalanceResponseDto>();

            foreach (var cuenta in cuentas)
            {
                result[cuenta.Red.ToLower()] = new BalanceResponseDto
                {
                    Native = cuenta.SaldoNativo,
                    NativeSymbol = cuenta.Red.ToLower() == "solana" ? "SOL" : cuenta.Red.ToLower() == "bitcoin" ? "BTC" : "BNB",
                    NativeUSD = cuenta.SaldoUsd
                };
            }

            // Fill default zeroes if user doesn't have accounts registered yet
            var networks = new[] { "solana", "bitcoin", "bnb" };
            foreach (var net in networks)
            {
                if (!result.ContainsKey(net))
                {
                    result[net] = new BalanceResponseDto
                    {
                        Native = 0m,
                        NativeSymbol = net == "solana" ? "SOL" : net == "bitcoin" ? "BTC" : "BNB",
                        NativeUSD = 0m
                    };
                }
            }

            return result;
        }

        public async Task<bool> BlockAccountAsync(Guid usuarioId, string address, string pin)
        {
            var user = await _unitOfWork.Usuarios.GetByIdAsync(usuarioId);
            if (user == null)
            {
                throw new Exception("Usuario no encontrado.");
            }

            if (HashPin(pin) != user.PinHash)
            {
                throw new Exception("PIN incorrecto. Operación no autorizada.");
            }

            var cuenta = await _unitOfWork.Cuentas.GetByAddressAsync(address);
            if (cuenta == null || cuenta.UsuarioId != usuarioId)
            {
                throw new Exception("La cuenta solicitada no existe o no pertenece al usuario autenticado.");
            }

            cuenta.EstadoCuenta = "Bloqueada";
            cuenta.FechaBloqueo = DateTime.UtcNow;

            _unitOfWork.Cuentas.Update(cuenta);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        private string HashPin(string pin)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(pin));
            return Convert.ToHexString(bytes);
        }
    }
}
