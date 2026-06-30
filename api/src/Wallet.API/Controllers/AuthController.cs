using Microsoft.AspNetCore.Mvc;
using Wallet.Application.DTOs;
using Wallet.Application.Services;
using Wallet.API.Models;
using System;
using System.Threading.Tasks;

namespace Wallet.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            try
            {
                var response = await _authService.RegisterAsync(dto);
                return Ok(new ApiResponse<AuthResponseDto>
                {
                    Success = true,
                    Data = response
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AuthResponseDto>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "REGISTRATION_FAILED",
                        Message = ex.Message,
                        StatusCode = 400
                    }
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            try
            {
                var response = await _authService.LoginAsync(dto);
                return Ok(new ApiResponse<AuthResponseDto>
                {
                    Success = true,
                    Data = response
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<AuthResponseDto>
                {
                    Success = false,
                    Error = new ApiError
                    {
                        Code = "LOGIN_FAILED",
                        Message = ex.Message,
                        StatusCode = 400
                    }
                });
            }
        }
    }
}
