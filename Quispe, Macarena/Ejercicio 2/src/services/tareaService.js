function normalizarNombre(nombre) {
  const valor = String(nombre ?? '').trim().toLowerCase();

  if (!valor) {
    throw new Error('El nombre es obligatorio');
  }

  if (valor.length < 2 || valor.length > 100) {
    throw new Error('El nombre debe tener entre 2 y 100 caracteres');
  }

  return valor;
}

function parseEstadoBooleano(estado) {
  if (typeof estado === 'boolean') {
    return estado;
  }

  if (typeof estado === 'string') {
    const valor = estado.trim().toLowerCase();
    if (valor === 'true') return true;
    if (valor === 'false') return false;
  }

  throw new Error('El estado debe ser un valor booleano válido');
}

function serializarTarea(tarea) {
  return {
    ...tarea,
    completada: Boolean(tarea.completada)
  };
}

module.exports = {
  normalizarNombre,
  parseEstadoBooleano,
  serializarTarea
};
