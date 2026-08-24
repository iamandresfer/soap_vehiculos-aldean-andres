'use strict';

const SERVICE_URL = '/VehiculoService.svc';
const NS = 'http://tempuri.org/';
const NS_MODELS = 'http://schemas.datacontract.org/2004/07/soap_vehiculos.Models';

function escapeXml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function llamarSoap(operacion, cuerpoXml) {
  const envelope =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
    '<soap:Body>' + cuerpoXml + '</soap:Body>' +
    '</soap:Envelope>';

  const respuesta = await fetch(SERVICE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': NS + 'IVehiculoService/' + operacion
    },
    body: envelope
  });

  const texto = await respuesta.text();
  const doc = new DOMParser().parseFromString(texto, 'text/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('Respuesta XML invalida: ' + texto.substring(0, 300));
  }

  const fault = doc.getElementsByTagNameNS('*', 'Fault')[0];
  if (fault) {
    throw new Error(fault.textContent.trim() || 'Falla SOAP desconocida');
  }

  return doc;
}

function resultado(doc, operacion) {
  return doc.getElementsByTagNameNS(NS, operacion + 'Result')[0];
}

function etiquetas(el, nombre) {
  return [...(el ? el.getElementsByTagNameNS('*', nombre) : [])];
}

function entidadUnica(doc, operacion) {
  const res = resultado(doc, operacion);
  if (!res) return null;

  const envueltos = etiquetas(res, 'Vehiculo');
  if (envueltos.length) return parseVehiculo(envueltos[0]);

  return res.childElementCount > 0 ? parseVehiculo(res) : null;
}

function hijo(el, nombre) {
  if (!el) return null;
  for (const nodo of el.children) {
    if (nodo.localName === nombre) return nodo;
  }
  return null;
}

function textoHijo(el, nombre) {
  const nodo = hijo(el, nombre);
  return nodo ? nodo.textContent : '';
}

function parseCategoria(el) {
  return {
    IdCategoria: Number(textoHijo(el, 'IdCategoria')),
    Nombre: textoHijo(el, 'Nombre'),
    Descripcion: textoHijo(el, 'Descripcion'),
    Estado: textoHijo(el, 'Estado') === 'true'
  };
}

function parseVehiculo(el) {
  return {
    IdVehiculo: Number(textoHijo(el, 'IdVehiculo')),
    Placa: textoHijo(el, 'Placa'),
    Marca: textoHijo(el, 'Marca'),
    Modelo: textoHijo(el, 'Modelo'),
    Anio: textoHijo(el, 'Anio'),
    Estado: textoHijo(el, 'Estado') === 'true',
    IdCategoria: Number(textoHijo(el, 'IdCategoria'))
  };
}

async function ObtenerCategorias() {
  const doc = await llamarSoap('ObtenerCategorias', '<ObtenerCategorias xmlns="' + NS + '"/>');
  return [...etiquetas(resultado(doc, 'ObtenerCategorias'), 'Categoria')].map(parseCategoria);
}

async function ObtenerVehiculos() {
  const doc = await llamarSoap('ObtenerVehiculos', '<ObtenerVehiculos xmlns="' + NS + '"/>');
  return etiquetas(resultado(doc, 'ObtenerVehiculos'), 'Vehiculo').map(parseVehiculo);
}

async function ObtenerVehiculo(id) {
  const cuerpo = '<ObtenerVehiculo xmlns="' + NS + '"><id>' + id + '</id></ObtenerVehiculo>';
  const doc = await llamarSoap('ObtenerVehiculo', cuerpo);
  return entidadUnica(doc, 'ObtenerVehiculo');
}

async function AgregarVehiculo(v) {
  const cuerpo =
    '<AgregarVehiculo xmlns="' + NS + '">' +
      '<vehiculo xmlns:a="' + NS_MODELS + '">' +
        '<a:Anio>' + escapeXml(v.Anio) + '</a:Anio>' +
        '<a:Estado>' + v.Estado + '</a:Estado>' +
        '<a:IdCategoria>' + v.IdCategoria + '</a:IdCategoria>' +
        '<a:IdVehiculo>0</a:IdVehiculo>' +
        '<a:Marca>' + escapeXml(v.Marca) + '</a:Marca>' +
        '<a:Modelo>' + escapeXml(v.Modelo) + '</a:Modelo>' +
        '<a:Placa>' + escapeXml(v.Placa) + '</a:Placa>' +
      '</vehiculo>' +
    '</AgregarVehiculo>';
  const doc = await llamarSoap('AgregarVehiculo', cuerpo);
  return entidadUnica(doc, 'AgregarVehiculo');
}

async function ActualizarVehiculo(v) {
  const cuerpo =
    '<ActualizarVehiculo xmlns="' + NS + '">' +
      '<vehiculo xmlns:a="' + NS_MODELS + '">' +
        '<a:Anio>' + escapeXml(v.Anio) + '</a:Anio>' +
        '<a:Estado>' + v.Estado + '</a:Estado>' +
        '<a:IdCategoria>' + v.IdCategoria + '</a:IdCategoria>' +
        '<a:IdVehiculo>' + v.IdVehiculo + '</a:IdVehiculo>' +
        '<a:Marca>' + escapeXml(v.Marca) + '</a:Marca>' +
        '<a:Modelo>' + escapeXml(v.Modelo) + '</a:Modelo>' +
        '<a:Placa>' + escapeXml(v.Placa) + '</a:Placa>' +
      '</vehiculo>' +
    '</ActualizarVehiculo>';
  const doc = await llamarSoap('ActualizarVehiculo', cuerpo);
  return entidadUnica(doc, 'ActualizarVehiculo');
}

async function EliminarVehiculo(id) {
  const cuerpo = '<EliminarVehiculo xmlns="' + NS + '"><id>' + id + '</id></EliminarVehiculo>';
  const doc = await llamarSoap('EliminarVehiculo', cuerpo);
  return resultado(doc, 'EliminarVehiculo').textContent.trim() === 'true';
}

async function ObtenerVehiculoPorMarca(marca) {
  const cuerpo = '<ObtenerVehiculoPorMarca xmlns="' + NS + '"><marca>' + escapeXml(marca) + '</marca></ObtenerVehiculoPorMarca>';
  const doc = await llamarSoap('ObtenerVehiculoPorMarca', cuerpo);
  return etiquetas(resultado(doc, 'ObtenerVehiculoPorMarca'), 'Vehiculo').map(parseVehiculo);
}

async function ObtenerVehiculoPorCategoria(idCategoria) {
  const cuerpo = '<ObtenerVehiculoPorCategoria xmlns="' + NS + '"><idCategoria>' + idCategoria + '</idCategoria></ObtenerVehiculoPorCategoria>';
  const doc = await llamarSoap('ObtenerVehiculoPorCategoria', cuerpo);
  return etiquetas(resultado(doc, 'ObtenerVehiculoPorCategoria'), 'Vehiculo').map(parseVehiculo);
}
