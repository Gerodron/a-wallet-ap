using System;
using System.Text.Json.Serialization;

namespace Wallet.API.Models
{
    public class BroadcastRequest
    {
        [JsonPropertyName("network")]
        public string Network { get; set; } = string.Empty;

        [JsonPropertyName("senderAddress")]
        public string SenderAddress { get; set; } = string.Empty;

        [JsonPropertyName("rawTransaction")]
        public string RawTransaction { get; set; } = string.Empty;
    }

    public class BroadcastResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "confirmed";

        [JsonPropertyName("transactionHash")]
        public string TransactionHash { get; set; } = string.Empty;

        [JsonPropertyName("network")]
        public string Network { get; set; } = string.Empty;

        [JsonPropertyName("feeConsumed")]
        public decimal FeeConsumed { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ErrorResponse
    {
        [JsonPropertyName("error")]
        public string Error { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public int Code { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
