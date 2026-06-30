using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wallet.Application.DTOs;
using Wallet.Application.Services;
using Wallet.API.Models;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Wallet.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/accounts")]
    [Route("api/cuentas")]
    public class CuentasController : ControllerBase
    {
        private readonly CuentaService _cuentaService;

        public CuentasController(CuentaService cuentaService)
        {
            _cuentaService = cuentaService;
        }

        [HttpGet("balances")]
        public async Task<IActionResult> GetBalances()
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
                var balances = await _cuentaService.GetBalancesAsync(userId);
                return Ok(new ApiResponse<Dictionary<string, BalanceResponseDto>>
                {
                    Success = true,
                    Data = balances
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError { Code = "BALANCE_FAILED", Message = ex.Message, StatusCode = 400 }
                });
            }
        }

        [HttpPost("bloquear")]
        [HttpPost("block")]
        public async Task<IActionResult> BlockAccount([FromBody] BlockAccountRequestDto dto)
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
                var success = await _cuentaService.BlockAccountAsync(userId, dto.AccountId, dto.Pin);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Data = new { success, message = "La cuenta ha sido bloqueada preventivamente de forma exitosa." }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError { Code = "BLOCK_FAILED", Message = ex.Message, StatusCode = 400 }
                });
            }
        }
    }
}
