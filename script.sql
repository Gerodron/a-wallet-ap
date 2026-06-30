-- ===========================================================================
-- DATABASE CREATION AND INITIALIZATION SCRIPT FOR SQL SERVER
-- Project: A-Wallet (Non-Custodial FinTech Wallet API Backing)
-- Author: Full-Stack Architect
-- Date: 2026-06-29
-- ===========================================================================

USE master;
GO

-- 1. Crear Base de Datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AWalletDB')
BEGIN
    CREATE DATABASE AWalletDB;
    PRINT 'Base de datos [AWalletDB] creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos [AWalletDB] ya existe.';
END;
GO

USE AWalletDB;
GO

-- 2. Eliminar Tablas si existen para asegurar reejecución limpia
IF OBJECT_ID('dbo.LogsSeguridad', 'U') IS NOT NULL DROP TABLE dbo.LogsSeguridad;
IF OBJECT_ID('dbo.Transacciones', 'U') IS NOT NULL DROP TABLE dbo.Transacciones;
IF OBJECT_ID('dbo.Cuentas', 'U') IS NOT NULL DROP TABLE dbo.Cuentas;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
GO

-- ===========================================================================
-- 3. Creación de Tablas Normalizadas
-- ===========================================================================

-- Tabla de Usuarios
CREATE TABLE dbo.Usuarios (
    UsuarioId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    NombreUsuario NVARCHAR(100) NOT NULL UNIQUE,
    PinHash NVARCHAR(256) NOT NULL, -- Almacena hash SHA-256/PBKDF2 del PIN de 6 dígitos
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UltimoAcceso DATETIME2 NULL
);

-- Tabla de Cuentas (Direcciones cripto por red y su saldo)
CREATE TABLE dbo.Cuentas (
    CuentaId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UsuarioId UNIQUEIDENTIFIER NOT NULL,
    DireccionPublica NVARCHAR(128) NOT NULL UNIQUE,
    Red NVARCHAR(50) NOT NULL, -- 'solana', 'bitcoin', 'bnb'
    SaldoNativo DECIMAL(28, 18) NOT NULL DEFAULT 0.000000000000000000, -- Precisión decimal para cripto
    SaldoUsd DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    EstadoCuenta NVARCHAR(20) NOT NULL DEFAULT 'Activa', -- 'Activa', 'Bloqueada_Prev'
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FechaBloqueo DATETIME2 NULL,
    
    CONSTRAINT FK_Cuentas_Usuarios FOREIGN KEY (UsuarioId) 
        REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE,
    CONSTRAINT CK_Cuentas_Estado CHECK (EstadoCuenta IN ('Activa', 'Bloqueada'))
);

-- Tabla de Transacciones
CREATE TABLE dbo.Transacciones (
    TransaccionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CuentaOrigenId UNIQUEIDENTIFIER NULL, -- Nullable en caso de fondeo externo a la wallet
    DireccionDestino NVARCHAR(128) NOT NULL,
    Monto DECIMAL(28, 18) NOT NULL,
    Red NVARCHAR(50) NOT NULL,
    TxHash NVARCHAR(128) NOT NULL UNIQUE, -- Identificador de la transacción en la Blockchain
    EstadoTransaccion NVARCHAR(20) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'Completada', 'Fallida'
    FechaTransaccion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Transacciones_Cuentas FOREIGN KEY (CuentaOrigenId) 
        REFERENCES dbo.Cuentas(CuentaId) ON DELETE NO ACTION,
    CONSTRAINT CK_Transacciones_Estado CHECK (EstadoTransaccion IN ('Pendiente', 'Completada', 'Fallida'))
);

-- Tabla de Logs de Seguridad y Auditoría
CREATE TABLE dbo.LogsSeguridad (
    LogId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UsuarioId UNIQUEIDENTIFIER NULL,
    Accion NVARCHAR(100) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'TRANSFER_INIT', 'ACCOUNT_BLOCK'
    IpDireccion NVARCHAR(50) NULL,
    Detalle NVARCHAR(500) NULL,
    FechaRegistro DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_LogsSeguridad_Usuarios FOREIGN KEY (UsuarioId) 
        REFERENCES dbo.Usuarios(UsuarioId) ON DELETE SET NULL
);
GO

-- ===========================================================================
-- 4. Creación de Índices para Optimización de Consultas
-- ===========================================================================

-- Índice para búsquedas rápidas de cuentas de un usuario
CREATE INDEX IX_Cuentas_UsuarioId ON dbo.Cuentas(UsuarioId);

-- Índice para histórico de transacciones realizadas desde una cuenta
CREATE INDEX IX_Transacciones_CuentaOrigenId ON dbo.Transacciones(CuentaOrigenId);

-- Índice para auditorías rápidas sobre acciones de seguridad de usuarios
CREATE INDEX IX_LogsSeguridad_UsuarioId ON dbo.LogsSeguridad(UsuarioId);
GO

PRINT 'Esquema de Base de Datos e Índices creados exitosamente en [AWalletDB].';
GO
