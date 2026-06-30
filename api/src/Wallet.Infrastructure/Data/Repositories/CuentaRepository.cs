using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Wallet.Domain.Entities;
using Wallet.Domain.Interfaces;

namespace Wallet.Infrastructure.Data.Repositories
{
    public class CuentaRepository : ICuentaRepository
    {
        private readonly ApplicationDbContext _context;

        public CuentaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Cuenta?> GetByIdAsync(Guid id)
        {
            return await _context.Cuentas.FindAsync(id);
        }

        public async Task<Cuenta?> GetByAddressAsync(string address)
        {
            return await _context.Cuentas
                .FirstOrDefaultAsync(c => c.DireccionPublica.ToLower() == address.ToLower());
        }

        public async Task<IEnumerable<Cuenta>> GetByUsuarioIdAsync(Guid usuarioId)
        {
            return await _context.Cuentas
                .Where(c => c.UsuarioId == usuarioId)
                .ToListAsync();
        }

        public async Task AddAsync(Cuenta cuenta)
        {
            await _context.Cuentas.AddAsync(cuenta);
        }

        public void Update(Cuenta cuenta)
        {
            _context.Cuentas.Update(cuenta);
        }
    }
}
