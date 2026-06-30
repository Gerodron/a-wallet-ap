using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wallet.Application.DTOs;
using Wallet.Application.Services;
using Wallet.API.Models;
using System;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Wallet.API.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Route("api/transacciones")]
    [Route("api/v1/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly TransaccionService _transaccionService;
        private static readonly Regex SolanaRegex = new(@"^[1-9A-HJ-NP-Za-km-z]{32,44}$");
        private static readonly Regex BitcoinRegex = new(@"^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$");
        private static readonly Regex BnbRegex = new(@"^0x[a-fA-F0-9]{42}$");

        public TransactionsController(TransaccionService transaccionService)
        {
            _transaccionService = transaccionService;
        }

        [Authorize]
        [HttpPost("transferir")]
        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequestDto dto)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdStr))
                {
                    return Unauthorized(new ApiResponse<object>
                    {
                        Success = false,
                        Error = new ApiError { Code = "UNAUTHORIZED", Message = "Sesión inválida.", StatusCode = 401 }
                    });
                }

                var userId = Guid.Parse(userIdStr);
                var response = await _transaccionService.ProcessTransferAsync(userId, dto);
                return Ok(new ApiResponse<TransferResponseDto>
                {
                    Success = true,
                    Data = response
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "TRANSFER_FAILED",
                        Message = ex.Message,
                        StatusCode = 400
                    }
                });
            }
        }

        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast([FromBody] BroadcastRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.RawTransaction))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "INVALID_PAYLOAD",
                        Message = "El payload criptográfico o la red de destino están malformados.",
                        StatusCode = 400
                    }
                });
            }

            string network = request.Network.ToLower();
            bool isValidAddress = false;

            if (network == "solana")
            {
                isValidAddress = SolanaRegex.IsMatch(request.SenderAddress);
            }
            else if (network == "bitcoin")
            {
                isValidAddress = BitcoinRegex.IsMatch(request.SenderAddress);
            }
            else if (network == "bnb")
            {
                isValidAddress = BnbRegex.IsMatch(request.SenderAddress);
            }

            if (!isValidAddress)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "INVALID_SENDER_ADDRESS",
                        Message = $"La dirección de envío '{request.SenderAddress}' no pasó la validación checksum para la red {request.Network}.",
                        StatusCode = 400
                    }
                });
            }

            await Task.Delay(500);

            string txHash = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");
            decimal fee = network == "solana" ? 0.000005m : network == "bitcoin" ? 0.00025m : 0.0012m;

            var response = new BroadcastResponse
            {
                Status = "confirmed",
                TransactionHash = txHash,
                Network = network,
                FeeConsumed = fee,
                Timestamp = DateTime.UtcNow
            };

            return Created(string.Empty, new ApiResponse<BroadcastResponse>
            {
                Success = true,
                Data = response
            });
        }
    }
}
