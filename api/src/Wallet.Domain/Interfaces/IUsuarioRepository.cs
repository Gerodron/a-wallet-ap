using System;
using System.Threading.Tasks;
using Wallet.Domain.Entities;

namespace Wallet.Domain.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetByIdAsync(Guid id);
        Task<Usuario?> GetByUsernameAsync(string username);
        Task AddAsync(Usuario usuario);
        void Update(Usuario usuario);
    }
}
