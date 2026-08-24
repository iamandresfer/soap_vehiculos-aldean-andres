using Microsoft.EntityFrameworkCore;
using soap_vehiculos.Models;

namespace soap_vehiculos.Data
{
    public class VehiculosDBContext : DbContext
    {
        public VehiculosDBContext(DbContextOptions<VehiculosDBContext> options)
            : base(options)
        {
        }

        public DbSet<Categoria> Categorias { get; set; }

        public DbSet<Vehiculo> Vehiculos { get; set; }
    }
}
