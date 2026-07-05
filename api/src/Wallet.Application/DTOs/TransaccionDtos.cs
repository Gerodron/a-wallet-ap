using System;

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

    public class TransaccionHistorialDto
    {
        public Guid TransaccionId { get; set; }
        public string TxHash { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Red { get; set; } = string.Empty;
        public string DireccionDestino { get; set; } = string.Empty;
        public string EstadoTransaccion { get; set; } = string.Empty;
        public DateTime FechaTransaccion { get; set; }
        /// <summary>Derived from context: 'send' for outgoing.</summary>
        public string Tipo { get; set; } = "send";
    }

    public class GetHistorialResponseDto
    {
        public List<TransaccionHistorialDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
