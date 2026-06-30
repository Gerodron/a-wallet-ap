using System;

namespace Wallet.Domain.Entities
{
    public class Transaccion
    {
        public Guid TransaccionId { get; set; } = Guid.NewGuid();
        public Guid? CuentaOrigenId { get; set; }
        public string DireccionDestino { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Red { get; set; } = string.Empty;
        public string TxHash { get; set; } = string.Empty;
        public string EstadoTransaccion { get; set; } = "Pendiente"; // 'Pendiente', 'Completada', 'Fallida'
        public DateTime FechaTransaccion { get; set; } = DateTime.UtcNow;

        // Relaciones
        public Cuenta? CuentaOrigen { get; set; }
    }
}
