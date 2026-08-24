using CoreWCF;
using soap_vehiculos.Models;

namespace soap_vehiculos.Services
{
    [ServiceContract]
    public interface IVehiculoService
    {
        [OperationContract]
        List<Categoria> ObtenerCategorias();

        [OperationContract]
        List<Vehiculo> ObtenerVehiculos();

        [OperationContract]
        Vehiculo? ObtenerVehiculo(int id);

        [OperationContract]
        Vehiculo AgregarVehiculo(Vehiculo vehiculo);

        [OperationContract]
        Vehiculo? ActualizarVehiculo(Vehiculo vehiculo);

        [OperationContract]
        bool EliminarVehiculo(int id);

        [OperationContract]
        List<Vehiculo> ObtenerVehiculoPorMarca(string marca);

        [OperationContract]
        List<Vehiculo> ObtenerVehiculoPorCategoria(int idCategoria);
    }
}
