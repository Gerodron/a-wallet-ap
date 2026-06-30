using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Wallet.API.Models
{
    public class RegisterRequest
    {
        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;

        [JsonPropertyName("pin")]
        public string Pin { get; set; } = string.Empty;

        [JsonPropertyName("addresses")]
        public Dictionary<string, string> Addresses { get; set; } = new();
    }

    public class AuthResponse
    {
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [JsonPropertyName("pin")]
        public string Pin { get; set; } = string.Empty;
    }

    public class BalanceItem
    {
        [JsonPropertyName("native")]
        public decimal Native { get; set; }

        [JsonPropertyName("nativeSymbol")]
        public string NativeSymbol { get; set; } = string.Empty;

        [JsonPropertyName("nativeUSD")]
        public decimal NativeUSD { get; set; }
    }

    public class TransferRequest
    {
        [JsonPropertyName("fromAddress")]
        public string FromAddress { get; set; } = string.Empty;

        [JsonPropertyName("toAddress")]
        public string ToAddress { get; set; } = string.Empty;

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("network")]
        public string Network { get; set; } = string.Empty;

        [JsonPropertyName("pin")]
        public string Pin { get; set; } = string.Empty;
    }

    public class BlockAccountRequest
    {
        [JsonPropertyName("accountId")]
        public string AccountId { get; set; } = string.Empty;

        [JsonPropertyName("pin")]
        public string Pin { get; set; } = string.Empty;
    }

    public class ApiResponse<T>
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; } = true;

        [JsonPropertyName("data")]
        public T? Data { get; set; }

        [JsonPropertyName("error")]
        public ApiError? Error { get; set; }
    }

    public class ApiError
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("statusCode")]
        public int StatusCode { get; set; }
    }
}
