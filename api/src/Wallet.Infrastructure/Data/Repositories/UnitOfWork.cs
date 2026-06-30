using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using Wallet.Domain.Interfaces;

namespace Wallet.Infrastructure.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Usuarios = new UsuarioRepository(_context);
            Cuentas = new CuentaRepository(_context);
            Transacciones = new TransaccionRepository(_context);
        }

        public IUsuarioRepository Usuarios { get; }
        public ICuentaRepository Cuentas { get; }
        public ITransaccionRepository Transacciones { get; }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _context.Dispose();
            _transaction?.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
