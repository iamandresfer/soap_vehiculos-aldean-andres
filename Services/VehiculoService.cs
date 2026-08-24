using CoreWCF;
using Microsoft.EntityFrameworkCore;
using soap_vehiculos.Data;
using soap_vehiculos.Models;

namespace soap_vehiculos.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
    public class VehiculoService : IVehiculoService
    {
        private readonly VehiculosDBContext _context;

        public VehiculoService(VehiculosDBContext context)
        {
            _context = context;
        }

        public List<Categoria> ObtenerCategorias()
        {
            return _context.Categorias.ToList();
        }

        public List<Vehiculo> ObtenerVehiculos()
        {
            return _context.Vehiculos.ToList();
        }

        public Vehiculo? ObtenerVehiculo(int id)
        {
            return _context.Vehiculos.Find(id);
        }

        public Vehiculo AgregarVehiculo(Vehiculo vehiculo)
        {
            _context.Vehiculos.Add(vehiculo);
            _context.SaveChanges();

            return vehiculo;
        }

        public Vehiculo? ActualizarVehiculo(Vehiculo vehiculo)
        {
            var vehiculoExistente = _context.Vehiculos.Find(vehiculo.IdVehiculo);

            if (vehiculoExistente == null)
            {
                return null;
            }

            vehiculoExistente.Placa = vehiculo.Placa;
            vehiculoExistente.Marca = vehiculo.Marca;
            vehiculoExistente.Modelo = vehiculo.Modelo;
            vehiculoExistente.Anio = vehiculo.Anio;
            vehiculoExistente.Estado = vehiculo.Estado;
            vehiculoExistente.IdCategoria = vehiculo.IdCategoria;

            _context.SaveChanges();

            return vehiculoExistente;
        }

        public bool EliminarVehiculo(int id)
        {
            var vehiculoExistente = _context.Vehiculos.Find(id);

            if (vehiculoExistente == null)
            {
                return false;
            }

            _context.Vehiculos.Remove(vehiculoExistente);
            _context.SaveChanges();

            return true;
        }

        public List<Vehiculo> ObtenerVehiculoPorMarca(string marca)
        {
            return _context.Vehiculos
                .Where(v => v.Marca.Contains(marca))
                .ToList();
        }

        public List<Vehiculo> ObtenerVehiculoPorCategoria(int idCategoria)
        {
            return _context.Vehiculos
                .Where(v => v.IdCategoria == idCategoria)
                .ToList();
        }
    }
}
