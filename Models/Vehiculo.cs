using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soap_vehiculos.Models
{
    [Table("Vehiculo")]
    public class Vehiculo
    {
        [Key]
        public int IdVehiculo { get; set; }

        public string Placa { get; set; } = string.Empty;

        public string Marca { get; set; } = string.Empty;

        public string Modelo { get; set; } = string.Empty;

        public string? Anio { get; set; }

        public bool Estado { get; set; }

        public int IdCategoria { get; set; }
    }
}
