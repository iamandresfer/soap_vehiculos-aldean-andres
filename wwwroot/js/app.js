'use strict';

let categoriasCache = [];

function nombreCategoria(id) {
  const cat = categoriasCache.find(c => c.IdCategoria === id);
  return cat ? cat.Nombre : '(id ' + id + ')';
}

function etiquetaEstado(activo) {
  return activo
    ? '<span class="estado-si">Activo</span>'
    : '<span class="estado-no">Inactivo</span>';
}

function mostrarMensaje(texto, esError) {
  const el = document.getElementById('mensajeForma');
  el.textContent = texto;
  el.className = 'mensaje ' + (esError ? 'error' : 'ok');
}

function renderTablaVehiculos(contenedor, vehiculos, conAcciones) {
  if (!vehiculos.length) {
    contenedor.innerHTML = '<tr><td colspan="8" class="vacio">Sin resultados</td></tr>';
    return;
  }
  contenedor.innerHTML = vehiculos.map(v => `
    <tr>
      <td>${v.IdVehiculo}</td>
      <td>${v.Placa}</td>
      <td>${v.Marca}</td>
      <td>${v.Modelo}</td>
      <td>${v.Anio || '-'}</td>
      <td>${nombreCategoria(v.IdCategoria)}</td>
      <td>${etiquetaEstado(v.Estado)}</td>
      ${conAcciones ? `
        <td>
          <button class="chico" data-accion="editar" data-id="${v.IdVehiculo}">Editar</button>
          <button class="peligro" data-accion="eliminar" data-id="${v.IdVehiculo}">Eliminar</button>
        </td>` : ''}
    </tr>`).join('');
}

async function cargarCategorias() {
  categoriasCache = await ObtenerCategorias();

  document.getElementById('tablaCategorias').innerHTML = categoriasCache.map(c => `
    <tr>
      <td>${c.IdCategoria}</td>
      <td>${c.Nombre}</td>
      <td>${c.Descripcion || '-'}</td>
      <td>${etiquetaEstado(c.Estado)}</td>
    </tr>`).join('');

  const opciones = categoriasCache
    .map(c => `<option value="${c.IdCategoria}">${c.Nombre}</option>`)
    .join('');

  document.getElementById('selCategoriaVehiculo').innerHTML = opciones;
  document.getElementById('selCategoriaBusqueda').innerHTML = opciones;
}

async function cargarVehiculos() {
  const vehiculos = await ObtenerVehiculos();
  renderTablaVehiculos(document.getElementById('tablaVehiculos'), vehiculos, true);
}

function limpiarForma() {
  document.getElementById('formaVehiculo').reset();
  document.getElementById('campoIdVehiculo').value = '';
  document.getElementById('campoEstado').checked = true;
  document.getElementById('botonGuardar').textContent = 'Agregar';
  document.getElementById('botonCancelar').hidden = true;
  mostrarMensaje('', false);
}

function leerForma() {
  return {
    IdVehiculo: Number(document.getElementById('campoIdVehiculo').value) || 0,
    Placa: document.getElementById('campoPlaca').value.trim(),
    Marca: document.getElementById('campoMarca').value.trim(),
    Modelo: document.getElementById('campoModelo').value.trim(),
    Anio: document.getElementById('campoAnio').value.trim(),
    Estado: document.getElementById('campoEstado').checked,
    IdCategoria: Number(document.getElementById('selCategoriaVehiculo').value)
  };
}

async function editarVehiculo(id) {
  try {
    const v = await ObtenerVehiculo(id);
    if (!v) {
      mostrarMensaje('El vehiculo ' + id + ' ya no existe en la base. Tabla recargada.', true);
      await cargarVehiculos();
      return;
    }
    document.getElementById('campoIdVehiculo').value = v.IdVehiculo;
    document.getElementById('campoPlaca').value = v.Placa;
    document.getElementById('campoMarca').value = v.Marca;
    document.getElementById('campoModelo').value = v.Modelo;
    document.getElementById('campoAnio').value = v.Anio || '';
    document.getElementById('campoEstado').checked = v.Estado;
    document.getElementById('selCategoriaVehiculo').value = String(v.IdCategoria);
    document.getElementById('botonGuardar').textContent = 'Actualizar';
    document.getElementById('botonCancelar').hidden = false;
    mostrarMensaje('Editando vehiculo id ' + id, false);
    document.getElementById('formaVehiculo').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    mostrarMensaje('Error al obtener: ' + e.message, true);
  }
}

async function eliminarVehiculo(id) {
  if (!confirm('Eliminar el vehiculo con id ' + id + '?')) return;
  try {
    const ok = await EliminarVehiculo(id);
    if (!ok) {
      mostrarMensaje('El vehiculo ' + id + ' ya no existe. Tabla recargada.', true);
    } else {
      mostrarMensaje('Vehiculo eliminado', false);
    }
    await cargarVehiculos();
  } catch (e) {
    mostrarMensaje('Error al eliminar: ' + e.message, true);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarCategorias();
    await cargarVehiculos();
  } catch (e) {
    mostrarMensaje('No se pudo contactar el servicio SOAP: ' + e.message, true);
  }

  document.getElementById('formaVehiculo').addEventListener('submit', async ev => {
    ev.preventDefault();
    const v = leerForma();
    try {
      if (v.IdVehiculo > 0) {
        const actualizado = await ActualizarVehiculo(v);
        if (!actualizado) {
          mostrarMensaje('El vehiculo ' + v.IdVehiculo + ' ya no existe. Tabla recargada.', true);
          limpiarForma();
        } else {
          mostrarMensaje('Vehiculo actualizado', false);
          limpiarForma();
        }
      } else {
        const creado = await AgregarVehiculo(v);
        mostrarMensaje('Vehiculo agregado con id ' + creado.IdVehiculo, false);
      }
      limpiarForma();
      await cargarVehiculos();
    } catch (e) {
      mostrarMensaje('Error: ' + e.message, true);
    }
  });

  document.getElementById('botonCancelar').addEventListener('click', limpiarForma);

  document.getElementById('tablaVehiculos').addEventListener('click', ev => {
    const boton = ev.target.closest('button[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') editarVehiculo(id);
    if (boton.dataset.accion === 'eliminar') eliminarVehiculo(id);
  });

  document.getElementById('botonBuscarMarca').addEventListener('click', async () => {
    const marca = document.getElementById('busquedaMarca').value.trim();
    const salida = document.getElementById('resultadoMarca');
    if (!marca) { salida.innerHTML = '<div class="vacio">Escribe una marca</div>'; return; }
    try {
      renderTablaVehiculos(salida, await ObtenerVehiculoPorMarca(marca), false);
    } catch (e) {
      salida.innerHTML = '<div class="mensaje error">' + e.message + '</div>';
    }
  });

  document.getElementById('botonBuscarCategoria').addEventListener('click', async () => {
    const id = Number(document.getElementById('selCategoriaBusqueda').value);
    const salida = document.getElementById('resultadoCategoria');
    try {
      renderTablaVehiculos(salida, await ObtenerVehiculoPorCategoria(id), false);
    } catch (e) {
      salida.innerHTML = '<div class="mensaje error">' + e.message + '</div>';
    }
  });
});
