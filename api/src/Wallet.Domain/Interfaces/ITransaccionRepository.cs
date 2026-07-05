using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Wallet.Domain.Entities;

namespace Wallet.Domain.Interfaces
{
    public interface ITransaccionRepository
    {
        Task<Transaccion?> GetByIdAsync(Guid id);
        Task<Transaccion?> GetByTxHashAsync(string txHash);
        Task<IEnumerable<Transaccion>> GetByCuentaIdAsync(Guid cuentaId);
        Task<IEnumerable<Transaccion>> GetByUsuarioIdAsync(Guid usuarioId, string? network = null, int page = 1, int pageSize = 20);
        Task AddAsync(Transaccion transaccion);
    }
}
