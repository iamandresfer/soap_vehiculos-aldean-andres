-- =============================================================
-- Script de creacion de base de datos: VehiculosSOAPDB
-- Servidor: (LocalDB)\MSSQLLocalDB
-- Ejecucion: sqlcmd -S "(LocalDB)\MSSQLLocalDB" -E -i database\CrearBDVehiculos.sql
-- =============================================================

IF DB_ID(N'VehiculosSOAPDB') IS NULL
BEGIN
    CREATE DATABASE VehiculosSOAPDB;
END
GO

USE VehiculosSOAPDB;
GO

-- Tabla Categoria
IF OBJECT_ID(N'dbo.Categoria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categoria (
        IdCategoria INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Categoria PRIMARY KEY,
        Nombre      NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(300) NULL,
        Estado      BIT NOT NULL DEFAULT(1)
    );
END
GO

-- Tabla Vehiculo
IF OBJECT_ID(N'dbo.Vehiculo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Vehiculo (
        IdVehiculo  INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Vehiculo PRIMARY KEY,
        Placa       NVARCHAR(20)  NOT NULL,
        Marca       NVARCHAR(50)  NOT NULL,
        Modelo      NVARCHAR(50)  NOT NULL,
        Anio        NVARCHAR(4)   NULL,
        Estado      BIT NOT NULL DEFAULT(1),
        IdCategoria INT NOT NULL,
        CONSTRAINT FK_Vehiculo_Categoria FOREIGN KEY (IdCategoria)
            REFERENCES dbo.Categoria (IdCategoria)
    );
END
GO

-- Datos iniciales de categorias
IF NOT EXISTS (SELECT 1 FROM dbo.Categoria)
BEGIN
    INSERT INTO dbo.Categoria (Nombre, Descripcion, Estado) VALUES
    (N'Sedan',    N'Vehiculo de pasajeros con carroceria de tres volumenes', 1),
    (N'SUV',      N'Deportivo utilitario con mayor altura y capacidad',      1),
    (N'Camioneta',N'Vehiculo de carga o doble cabina',                       1);
END
GO

-- Datos de prueba de vehiculos
IF NOT EXISTS (SELECT 1 FROM dbo.Vehiculo)
BEGIN
    INSERT INTO dbo.Vehiculo (Placa, Marca, Modelo, Anio, Estado, IdCategoria) VALUES
    (N'PIC-1234', N'Toyota',    N'Corolla', N'2023', 1, 1),
    (N'MZD-2405', N'Mazda',     N'CX-5',    N'2024', 1, 2),
    (N'FRD-2210', N'Ford',      N'Ranger',  N'2022', 1, 3),
    (N'CHV-2330', N'Chevrolet', N'Onix',    N'2023', 0, 1);
END
GO

