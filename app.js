// Tasas de cambio (en la práctica deberías usar una API de tipos de cambio)
const tasasCambio = {
    MXN: 1,
    USD: 0.059, // 1 MXN = 0.059 USD
    EUR: 0.054,  // 1 MXN = 0.054 EUR
    COP: 233.85  // 1 MXN = 233.85 COP (aproximado)
};

// Función para cambiar el tema
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('theme', newTheme);
    
    // Actualizar el ícono del botón
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = newTheme === 'light' ? '🌙' : '☀️';

    // Actualizar gráficos con el nuevo tema
    calcular();
}

// Función para convertir moneda
function convertirMoneda(cantidad, monedaDestino) {
    const enPesos = cantidad / tasasCambio[monedaDestino];
    return enPesos * tasasCambio[monedaDestino];
}

// Función para formatear moneda
function formatearMoneda(cantidad, moneda) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: moneda
    }).format(cantidad);
}

// Función para calcular la ganancia total esperada
function calcularGananciaEsperada(precioFinal, costoMateriaPrima, cantidadVentas) {
    const gananciaUnitaria = precioFinal - costoMateriaPrima;
    return gananciaUnitaria * cantidadVentas;
}

// Función principal de cálculo actualizada
function calcular() {
    // Obtener valores base
    const costoMP = parseFloat(document.getElementById('costoMP').value) || 0;
    const costoEmpaque = parseFloat(document.getElementById('costoEmpaque').value) || 0;
    const costoManoObra = parseFloat(document.getElementById('costoManoObra').value) || 0;
    const costoEnvio = parseFloat(document.getElementById('costoEnvio').value) || 0;
    const costoMarketing = parseFloat(document.getElementById('costoMarketing').value) || 0;
    const margen = parseFloat(document.getElementById('margen').value) || 0;
    const impuestos = parseFloat(document.getElementById('impuestos').value) || 0;
    const ventas = parseInt(document.getElementById('ventas').value) || 0;
    const monedaSeleccionada = document.getElementById('moneda').value;

    // Validar que haya al menos algunos datos básicos
    if (costoMP === 0 && margen === 0) {
        return; // No calcular si no hay datos básicos
    }

    // Calcular costos totales
    const costosAdicionales = costoEmpaque + costoManoObra + costoEnvio + costoMarketing;
    const costoTotal = costoMP + costosAdicionales;

    // Calcular precio final y ganancias
    const gananciaBase = costoTotal * (margen / 100);
    const precioSinImpuestos = costoTotal + gananciaBase;
    const impuestosCalculados = precioSinImpuestos * (impuestos / 100);
    const precioFinal = precioSinImpuestos + impuestosCalculados;
    const gananciaTotal = (precioFinal - costoTotal) * ventas;

    // Convertir todos los valores a la moneda seleccionada
    const costoBaseConvertido = convertirMoneda(costoTotal, monedaSeleccionada);
    const costosAdicionalesConvertidos = convertirMoneda(costosAdicionales, monedaSeleccionada);
    const precioFinalConvertido = convertirMoneda(precioFinal, monedaSeleccionada);
    const gananciaTotalConvertida = convertirMoneda(gananciaTotal, monedaSeleccionada);

    // Mostrar resultados
    document.getElementById('costoBase').textContent = formatearMoneda(costoBaseConvertido, monedaSeleccionada);
    document.getElementById('costosAdicionales').textContent = formatearMoneda(costosAdicionalesConvertidos, monedaSeleccionada);
    document.getElementById('precioFinal').textContent = formatearMoneda(precioFinalConvertido, monedaSeleccionada);
    document.getElementById('gananciaTotal').textContent = formatearMoneda(gananciaTotalConvertida, monedaSeleccionada);
    document.getElementById('resultados').style.display = 'block';
}

// Función para cargar producto guardado actualizada
function cargarProducto(producto) {
    // Cargar valores en los campos
    document.getElementById('costoMP').value = producto.costos.materiaPrima || 0;
    document.getElementById('costoEmpaque').value = producto.costos.empaque || 0;
    document.getElementById('costoManoObra').value = producto.costos.manoObra || 0;
    document.getElementById('costoEnvio').value = producto.costos.envio || 0;
    document.getElementById('costoMarketing').value = producto.costos.marketing || 0;
    document.getElementById('margen').value = producto.margen || 0;
    document.getElementById('impuestos').value = producto.impuestos || 0;
    document.getElementById('ventas').value = producto.ventas || 0;

    // Ejecutar cálculo
    setTimeout(calcular, 100); // Pequeño delay para asegurar que los valores se cargaron
}

// Función para guardar producto
function guardarProducto() {
    // Obtener todos los valores actuales
    const producto = {
        nombre: '',  // Se llenará con el prompt
        costos: {
            materiaPrima: parseFloat(document.getElementById('costoMP').value) || 0,
            empaque: parseFloat(document.getElementById('costoEmpaque').value) || 0,
            manoDeObra: parseFloat(document.getElementById('costoManoObra').value) || 0,
            envio: parseFloat(document.getElementById('costoEnvio').value) || 0,
            marketing: parseFloat(document.getElementById('costoMarketing').value) || 0
        },
        margen: parseFloat(document.getElementById('margen').value) || 0,
        impuestos: parseFloat(document.getElementById('impuestos').value) || 0,
        ventas: parseInt(document.getElementById('ventas').value) || 0,
        moneda: document.getElementById('moneda').value,
        fecha: new Date().toISOString()
    };

    // Validar que haya al menos algunos datos básicos
    if (producto.costos.materiaPrima === 0 && producto.margen === 0) {
        alert('Por favor, ingresa al menos el costo de materia prima y el margen de ganancia.');
        return;
    }

    // Solicitar nombre del producto
    const nombreProducto = prompt('Ingrese nombre del producto:');
    if (!nombreProducto) {
        alert('Necesitas ingresar un nombre para guardar el producto.');
        return;
    }
    producto.nombre = nombreProducto;

    // Obtener productos existentes del localStorage
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');

    // Verificar si ya existe un producto con ese nombre
    const productoExistente = productos.findIndex(p => p.nombre === producto.nombre);
    if (productoExistente >= 0) {
        if (confirm('Ya existe un producto con este nombre. ¿Deseas sobrescribirlo?')) {
            productos[productoExistente] = producto;
        } else {
            return;
        }
    } else {
        productos.push(producto);
    }

    // Guardar en localStorage
    try {
        localStorage.setItem('productos', JSON.stringify(productos));
        actualizarListaProductos();
        alert('Producto guardado exitosamente.');
    } catch (error) {
        alert('Error al guardar el producto. Por favor, intenta de nuevo.');
        console.error('Error al guardar:', error);
    }
}

// Función para actualizar la lista de productos
function actualizarListaProductos() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const lista = document.getElementById('listaProductos');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (productos.length === 0) {
        lista.innerHTML = '<p class="no-productos">No hay productos guardados</p>';
        return;
    }

    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        const fecha = new Date(producto.fecha).toLocaleDateString();
        
        card.innerHTML = `
            <div class="producto-info">
                <h4>${producto.nombre}</h4>
                <p>Fecha: ${fecha}</p>
                <p>Moneda: ${producto.moneda}</p>
                <p>Costo Base: ${formatearMoneda(producto.costos.materiaPrima, producto.moneda)}</p>
            </div>
            <div class="producto-actions">
                <button onclick="cargarProductoGuardado('${encodeURIComponent(JSON.stringify(producto))}')" class="btn-cargar">
                    Cargar
                </button>
                <button onclick="eliminarProducto(${index})" class="btn-eliminar">
                    Eliminar
                </button>
            </div>
        `;
        
        lista.appendChild(card);
    });
}

// Nueva función para cargar producto
function cargarProductoGuardado(productoString) {
    try {
        const producto = JSON.parse(decodeURIComponent(productoString));

        // Cargar la moneda primero
        document.getElementById('moneda').value = producto.moneda;

        // Cargar costos
        document.getElementById('costoMP').value = producto.costos.materiaPrima;
        document.getElementById('costoEmpaque').value = producto.costos.empaque;
        document.getElementById('costoManoObra').value = producto.costos.manoObra;
        document.getElementById('costoEnvio').value = producto.costos.envio;
        document.getElementById('costoMarketing').value = producto.costos.marketing;

        // Cargar otros valores
        document.getElementById('margen').value = producto.margen;
        document.getElementById('impuestos').value = producto.impuestos;
        document.getElementById('ventas').value = producto.ventas;

        // Realizar el cálculo automáticamente
        calcular();

        // Mostrar mensaje de confirmación
        alert(`Producto "${producto.nombre}" cargado exitosamente`);

    } catch (error) {
        console.error('Error al cargar el producto:', error);
        alert('Error al cargar el producto. Por favor, intenta de nuevo.');
    }
}

// Función para eliminar producto
function eliminarProducto(index) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    productos.splice(index, 1);
    localStorage.setItem('productos', JSON.stringify(productos));
    actualizarListaProductos();
}

// Función para mostrar el modal de información
function mostrarInfo() {
    document.getElementById('infoModal').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para cerrar el modal de información
function cerrarInfo() {
    document.getElementById('infoModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
}

// Cerrar el modal si se hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        cerrarInfo();
    }
}

// Cargar tema preferido al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeButton = document.querySelector('.theme-toggle');
    themeButton.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    actualizarListaProductos();
});
