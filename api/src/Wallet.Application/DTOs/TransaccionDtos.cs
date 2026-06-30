namespace Wallet.Application.DTOs
{
    public class TransferRequestDto
    {
        public string FromAddress { get; set; } = string.Empty;
        public string ToAddress { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Network { get; set; } = string.Empty;
        public string Pin { get; set; } = string.Empty;
    }

    public class TransferResponseDto
    {
        public string TxHash { get; set; } = string.Empty;
        public string Status { get; set; } = "Completada";
        public string Message { get; set; } = string.Empty;
    }
}
