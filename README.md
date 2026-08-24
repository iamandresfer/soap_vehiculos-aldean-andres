# soap_vehiculos-aldean-andres

Servicio SOAP para la gestión de **Categorías** y **Vehículos**, construido con ASP.NET Core (**CoreWCF**) y **Entity Framework Core** sobre SQL Server LocalDB. Incluye una interfaz HTML de demostración (sin frameworks) y colección de Postman.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Runtime | .NET 10 (ASP.NET Core) |
| Servicio SOAP | CoreWCF.Http 1.9.1 |
| Acceso a datos | Entity Framework Core 10 + SQL Server |
| Base de datos | SQL Server LocalDB |
| Demo UI | HTML + JavaScript vanilla |

## Prerrequisitos

- [.NET SDK 10.0](https://dotnet.microsoft.com/download) o superior
- SQL Server LocalDB (viene incluido con Visual Studio)
  - Alternativa: cualquier instancia de SQL Server ajustando el connection string
- `sqlcmd` o SSMS para ejecutar el script de base de datos
- Visual Studio 2022 17.10+ (opcional, para abrir el `.slnx`)
- Postman (opcional, para probar las operaciones)

## Instalación y ejecución

```bash
# 1. Crear la base de datos con datos de prueba
sqlcmd -S "(LocalDB)\MSSQLLocalDB" -E -i database\CrearBDVehiculos.sql

# 2. Restaurar paquetes NuGet
dotnet restore

# 3. Ejecutar la aplicación (perfil http)
dotnet run --launch-profile http
```

Con Visual Studio: abrir `soap-vehiculos.slnx`, seleccionar el perfil **http** y presionar F5.

## URLs

| Recurso | URL |
|---|---|
| Interfaz de demostración | http://localhost:5057/ |
| Servicio SOAP | http://localhost:5057/VehiculoService.svc |
| WSDL | http://localhost:5057/VehiculoService.svc?wsdl |

## Operaciones SOAP

Todas las operaciones usan `BasicHttpBinding` (SOAP 1.1). Header `SOAPAction`: `http://tempuri.org/IVehiculoService/<Operacion>`.

| # | Operación | Parámetros | Retorno |
|---|---|---|---|
| 1 | `ObtenerCategorias` | — | `List<Categoria>` |
| 2 | `ObtenerVehiculos` | — | `List<Vehiculo>` |
| 3 | `ObtenerVehiculo` | `int id` | `Vehiculo?` |
| 4 | `AgregarVehiculo` | `Vehiculo` | `Vehiculo` (con Id generado) |
| 5 | `ActualizarVehiculo` | `Vehiculo` (incluye su Id) | `Vehiculo?` |
| 6 | `EliminarVehiculo` | `int id` | `bool` |
| 7 | `ObtenerVehiculoPorMarca` | `string marca` (parcial) | `List<Vehiculo>` |
| 8 | `ObtenerVehiculoPorCategoria` | `int idCategoria` | `List<Vehiculo>` |

Los cuerpos XML de cada operación están documentados en [`GUIA_POSTMAN.txt`](GUIA_POSTMAN.txt).

> **Nota importante:** los campos de la entidad `Vehiculo` en los requests deben ir en el namespace `http://schemas.datacontract.org/2004/07/soap_vehiculos.Models` y en orden alfabético (`Anio, Estado, IdCategoria, IdVehiculo, Marca, Modelo, Placa`), tal como exige `DataContractSerializer`.

## Estructura del proyecto

```
soap-vehiculos/
├── Data/
│   └── VehiculosDBContext.cs       # DbContext de EF Core
├── Models/
│   ├── Categoria.cs                # Entidad Categoría
│   └── Vehiculo.cs                 # Entidad Vehículo (FK IdCategoria)
├── Services/
│   ├── IVehiculoService.cs         # Contrato SOAP ([ServiceContract])
│   └── VehiculoService.cs          # Implementación CRUD + búsquedas
├── database/
│   └── CrearBDVehiculos.sql        # Script: BD, tablas y datos de prueba
├── wwwroot/
│   ├── index.html                  # Demo UI
│   └── js/
│       ├── soap-client.js          # Proxy SOAP genérico (fetch)
│       └── app.js                  # Render y eventos de la UI
├── Properties/
│   └── launchSettings.json         # Puertos (http = 5057)
├── Program.cs                      # Configuración CoreWCF + static files
├── appsettings.json                # Connection string LocalDB
├── postman_collection_soap.json    # Colección Postman (importar)
└── GUIA_POSTMAN.txt                # Guía de pruebas SOAP paso a paso
```

## Datos de prueba incluidos

El script SQL crea la base `VehiculosSOAPDB` con:

- **Categorías:** Sedán, SUV, Camioneta
- **Vehículos:** Toyota Corolla 2023, Mazda CX-5 2024, Ford Ranger 2022, Chevrolet Onix 2023 (inactivo)

El script es idempotente: puede ejecutarse varias veces sin duplicar datos.
