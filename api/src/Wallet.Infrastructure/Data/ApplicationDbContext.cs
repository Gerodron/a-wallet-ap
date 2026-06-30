using Microsoft.EntityFrameworkCore;
using Wallet.Domain.Entities;

namespace Wallet.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; } = null!;
        public DbSet<Cuenta> Cuentas { get; set; } = null!;
        public DbSet<Transaccion> Transacciones { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapping Usuarios table
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(e => e.UsuarioId);
                entity.Property(e => e.NombreUsuario).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.NombreUsuario).IsUnique();
            });

            // Mapping Cuentas table
            modelBuilder.Entity<Cuenta>(entity =>
            {
                entity.ToTable("Cuentas");
                entity.HasKey(e => e.CuentaId);
                entity.Property(e => e.DireccionPublica).IsRequired().HasMaxLength(128);
                entity.HasIndex(e => e.DireccionPublica).IsUnique();
                entity.Property(e => e.Red).IsRequired().HasMaxLength(50);
                entity.Property(e => e.SaldoNativo).HasColumnType("decimal(28,18)");
                entity.Property(e => e.SaldoUsd).HasColumnType("decimal(18,2)");
                entity.Property(e => e.EstadoCuenta).HasMaxLength(20);

                // Relationship: 1 Usuario -> N Cuentas
                entity.HasOne(d => d.Usuario)
                    .WithMany(p => p.Cuentas)
                    .HasForeignKey(d => d.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Mapping Transacciones table
            modelBuilder.Entity<Transaccion>(entity =>
            {
                entity.ToTable("Transacciones");
                entity.HasKey(e => e.TransaccionId);
                entity.Property(e => e.DireccionDestino).IsRequired().HasMaxLength(128);
                entity.Property(e => e.Red).IsRequired().HasMaxLength(50);
                entity.Property(e => e.TxHash).IsRequired().HasMaxLength(128);
                entity.HasIndex(e => e.TxHash).IsUnique();
                entity.Property(e => e.Monto).HasColumnType("decimal(28,18)");
                entity.Property(e => e.EstadoTransaccion).HasMaxLength(20);

                // Relationship: 1 Cuenta -> N Transacciones
                entity.HasOne(d => d.CuentaOrigen)
                    .WithMany(p => p.TransaccionesOrigen)
                    .HasForeignKey(d => d.CuentaOrigenId)
                    .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
