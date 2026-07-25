export class ErrorHttp extends Error {
    constructor(mensaje, {
        tipo = 'inesperado',
        estado = null,
        detalle = ''
    } = {}) {
        super(mensaje);
        this.name = 'ErrorHttp';
        this.tipo = tipo;
        this.estado = estado;
        this.detalle = detalle;
    }
}

export async function solicitarJson(url, opciones = {}) {
    let respuesta;

    try {
        respuesta = await fetch(url, opciones);
    } catch (error) {
        throw new ErrorHttp(
            'No fue posible conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.',
            {
                tipo: 'conexion',
                detalle: error instanceof Error ? error.message : String(error)
            }
        );
    }

    if (!respuesta.ok) {
        const detalle = await leerDetalleRespuesta(respuesta);
        throw crearErrorPorEstado(respuesta.status, detalle);
    }

    if (respuesta.status === 204) {
        return null;
    }

    const texto = await respuesta.text();

    if (!texto.trim()) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        throw new ErrorHttp(
            'El servidor devolvió una respuesta inesperada. Inténtalo de nuevo.',
            {
                tipo: 'respuesta',
                estado: respuesta.status,
                detalle: error instanceof Error ? error.message : String(error)
            }
        );
    }
}

export function normalizarId(id, nombre = 'ID') {
    const valor = String(id ?? '').trim();

    if (!valor) {
        throw new ErrorHttp(`${nombre} no es válido.`, {
            tipo: 'datos'
        });
    }

    return valor;
}

export function obtenerMensajeError(error, mensajeAlternativo) {
    if (error instanceof ErrorHttp) {
        return error.message;
    }

    return mensajeAlternativo;
}

export function asegurarLista(valor, recurso) {
    if (!Array.isArray(valor)) {
        throw new ErrorHttp(
            `El servidor devolvió una respuesta inesperada al cargar ${recurso}.`,
            { tipo: 'respuesta' }
        );
    }

    return valor;
}

async function leerDetalleRespuesta(respuesta) {
    try {
        return (await respuesta.text()).slice(0, 500);
    } catch {
        return '';
    }
}

function crearErrorPorEstado(estado, detalle) {
    if (estado === 404) {
        return new ErrorHttp('El recurso solicitado no fue encontrado.', {
            tipo: 'no-encontrado',
            estado,
            detalle
        });
    }

    if (estado === 400 || estado === 409 || estado === 422) {
        return new ErrorHttp('Los datos enviados no son válidos. Revisa la información e inténtalo de nuevo.', {
            tipo: 'datos',
            estado,
            detalle
        });
    }

    if (estado >= 500) {
        return new ErrorHttp('El servidor no pudo completar la operación. Inténtalo más tarde.', {
            tipo: 'servidor',
            estado,
            detalle
        });
    }

    return new ErrorHttp(`La solicitud no pudo completarse (HTTP ${estado}).`, {
        tipo: 'http',
        estado,
        detalle
    });
}
