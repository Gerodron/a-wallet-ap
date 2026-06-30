using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Wallet.Domain.Entities;
using Wallet.Domain.Interfaces;

namespace Wallet.Infrastructure.Data.Repositories
{
    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly ApplicationDbContext _context;

        public UsuarioRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario?> GetByIdAsync(Guid id)
        {
            return await _context.Usuarios
                .Include(u => u.Cuentas)
                .FirstOrDefaultAsync(u => u.UsuarioId == id);
        }

        public async Task<Usuario?> GetByUsernameAsync(string username)
        {
            return await _context.Usuarios
                .Include(u => u.Cuentas)
                .FirstOrDefaultAsync(u => u.NombreUsuario.ToLower() == username.ToLower());
        }

        public async Task AddAsync(Usuario usuario)
        {
            await _context.Usuarios.AddAsync(usuario);
        }

        public void Update(Usuario usuario)
        {
            _context.Usuarios.Update(usuario);
        }
    }
}
