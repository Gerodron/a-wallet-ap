using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Wallet.Domain.Entities;
using Wallet.Domain.Interfaces;

namespace Wallet.Infrastructure.Data.Repositories
{
    public class TransaccionRepository : ITransaccionRepository
    {
        private readonly ApplicationDbContext _context;

        public TransaccionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Transaccion?> GetByIdAsync(Guid id)
        {
            return await _context.Transacciones.FindAsync(id);
        }

        public async Task<Transaccion?> GetByTxHashAsync(string txHash)
        {
            return await _context.Transacciones
                .FirstOrDefaultAsync(t => t.TxHash.ToLower() == txHash.ToLower());
        }

        public async Task<IEnumerable<Transaccion>> GetByCuentaIdAsync(Guid cuentaId)
        {
            return await _context.Transacciones
                .Where(t => t.CuentaOrigenId == cuentaId)
                .OrderByDescending(t => t.FechaTransaccion)
                .ToListAsync();
        }

        public async Task AddAsync(Transaccion transaccion)
        {
            await _context.Transacciones.AddAsync(transaccion);
        }
    }
}
