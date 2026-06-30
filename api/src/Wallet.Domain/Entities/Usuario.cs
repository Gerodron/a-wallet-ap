using System;
using System.Collections.Generic;

namespace Wallet.Domain.Entities
{
    public class Usuario
    {
        public Guid UsuarioId { get; set; } = Guid.NewGuid();
        public string NombreUsuario { get; set; } = string.Empty;
        public string PinHash { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? UltimoAcceso { get; set; }

        // Relaciones
        public ICollection<Cuenta> Cuentas { get; set; } = new List<Cuenta>();
    }
}
