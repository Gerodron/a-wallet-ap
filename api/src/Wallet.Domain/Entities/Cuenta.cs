using System;
using System.Collections.Generic;

namespace Wallet.Domain.Entities
{
    public class Cuenta
    {
        public Guid CuentaId { get; set; } = Guid.NewGuid();
        public Guid UsuarioId { get; set; }
        public string DireccionPublica { get; set; } = string.Empty;
        public string Red { get; set; } = string.Empty; // 'solana', 'bitcoin', 'bnb'
        public decimal SaldoNativo { get; set; }
        public decimal SaldoUsd { get; set; }
        public string EstadoCuenta { get; set; } = "Activa"; // 'Activa', 'Bloqueada'
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaBloqueo { get; set; }

        // Relaciones
        public Usuario? Usuario { get; set; }
        public ICollection<Transaccion> TransaccionesOrigen { get; set; } = new List<Transaccion>();
    }
}
