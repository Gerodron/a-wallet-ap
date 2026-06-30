using System.Collections.Generic;

namespace Wallet.Application.DTOs
{
    public class RegisterRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Pin { get; set; } = string.Empty;
        public Dictionary<string, string> Addresses { get; set; } = new();
    }

    public class LoginRequestDto
    {
        public string Pin { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
