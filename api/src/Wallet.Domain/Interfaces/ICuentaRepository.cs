using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Wallet.Domain.Entities;

namespace Wallet.Domain.Interfaces
{
    public interface ICuentaRepository
    {
        Task<Cuenta?> GetByIdAsync(Guid id);
        Task<Cuenta?> GetByAddressAsync(string address);
        Task<IEnumerable<Cuenta>> GetByUsuarioIdAsync(Guid usuarioId);
        Task AddAsync(Cuenta cuenta);
        void Update(Cuenta cuenta);
    }
}
