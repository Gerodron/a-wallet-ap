using System;
using System.Threading.Tasks;

namespace Wallet.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUsuarioRepository Usuarios { get; }
        ICuentaRepository Cuentas { get; }
        ITransaccionRepository Transacciones { get; }
        Task<int> CompleteAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
