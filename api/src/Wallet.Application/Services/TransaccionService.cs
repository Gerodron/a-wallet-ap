using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Wallet.Domain.Entities;
using Wallet.Domain.Interfaces;
using Wallet.Application.DTOs;

namespace Wallet.Application.Services
{
    public class TransaccionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransaccionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TransferResponseDto> ProcessTransferAsync(Guid usuarioId, TransferRequestDto dto)
        {
            var user = await _unitOfWork.Usuarios.GetByIdAsync(usuarioId);
            if (user == null)
            {
                throw new Exception("Usuario no encontrado.");
            }

            // 1. PIN verification
            if (HashPin(dto.Pin) != user.PinHash)
            {
                throw new Exception("PIN incorrecto. Transferencia no autorizada.");
            }

            // 2. Fetch origin account
            var sourceAcc = await _unitOfWork.Cuentas.GetByAddressAsync(dto.FromAddress);
            if (sourceAcc == null)
            {
                // Auto-seed/create the account dynamically for testing if it doesn't exist in DB
                sourceAcc = new Cuenta
                {
                    UsuarioId = usuarioId,
                    DireccionPublica = dto.FromAddress,
                    Red = dto.Network,
                    SaldoNativo = 100.0m, // Pre-load 100 native tokens for testing
                    SaldoUsd = 100.0m * GetExchangeRate(dto.Network),
                    EstadoCuenta = "Activa"
                };
                await _unitOfWork.Cuentas.AddAsync(sourceAcc);
                await _unitOfWork.CompleteAsync();
            }
            else if (sourceAcc.UsuarioId != usuarioId)
            {
                throw new Exception("La dirección de origen ya está registrada por otro usuario.");
            }

            if (sourceAcc.EstadoCuenta == "Bloqueada")
            {
                throw new Exception("La cuenta de origen se encuentra bloqueada.");
            }

            // 3. Balance verification
            if (sourceAcc.SaldoNativo < dto.Amount)
            {
                throw new Exception("Saldo insuficiente para realizar esta transferencia.");
            }

            // Atomic execution boundary via UnitOfWork Transaction
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Decrement origin
                sourceAcc.SaldoNativo -= dto.Amount;
                sourceAcc.SaldoUsd = sourceAcc.SaldoNativo * GetExchangeRate(dto.Network);
                _unitOfWork.Cuentas.Update(sourceAcc);

                // Increment destination if it exists inside our system
                var destAcc = await _unitOfWork.Cuentas.GetByAddressAsync(dto.ToAddress);
                if (destAcc != null)
                {
                    destAcc.SaldoNativo += dto.Amount;
                    destAcc.SaldoUsd = destAcc.SaldoNativo * GetExchangeRate(dto.Network);
                    _unitOfWork.Cuentas.Update(destAcc);
                }

                // Generate on-chain TxHash simulator
                string txHash = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

                // Record transaction logs
                var tx = new Transaccion
                {
                    CuentaOrigenId = sourceAcc.CuentaId,
                    DireccionDestino = dto.ToAddress,
                    Monto = dto.Amount,
                    Red = dto.Network,
                    TxHash = txHash,
                    EstadoTransaccion = "Completada",
                    FechaTransaccion = DateTime.UtcNow
                };

                await _unitOfWork.Transacciones.AddAsync(tx);
                await _unitOfWork.CompleteAsync();

                // Commit the Db transaction
                await _unitOfWork.CommitTransactionAsync();

                return new TransferResponseDto
                {
                    TxHash = txHash,
                    Status = "Completada",
                    Message = "Transferencia realizada exitosamente de forma atómica."
                };
            }
            catch
            {
                // Rollback EF transaction if anything fails
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        private string HashPin(string pin)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(pin));
            return Convert.ToHexString(bytes);
        }

        private decimal GetExchangeRate(string network)
        {
            return network.ToLower() switch
            {
                "solana" => 140m,
                "bitcoin" => 68000m,
                "bnb" => 580m,
                _ => 1m
            };
        }
    }
}
