namespace Wallet.Application.DTOs
{
    public class BalanceResponseDto
    {
        public decimal Native { get; set; }
        public string NativeSymbol { get; set; } = string.Empty;
        public decimal NativeUSD { get; set; }
    }

    public class BlockAccountRequestDto
    {
        public string AccountId { get; set; } = string.Empty;
        public string Pin { get; set; } = string.Empty;
    }
}
