document.addEventListener('DOMContentLoaded', function() {
    // ============ VERIFICACIÓN DE AUTENTICACIÓN ============
    class AuthManager {
        static verificarAutenticacion() {
            const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
            return usuario !== null;
        }
    }

    // Redirigir si no está autenticado
    if (!AuthManager.verificarAutenticacion()) {
        alert('Debes iniciar sesión para realizar un pedido');
        localStorage.setItem('carritoPendiente', JSON.stringify(carrito));
        window.location.href = 'productos.html';
        return;
    }

    // Mostrar nombre de usuario
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = usuario.nombre.split(' ')[0]; // Mostrar solo el primer nombre
    } else {
        console.error('Elemento para mostrar el nombre de usuario no encontrado');
    }

    // ============ CÓDIGO EXISTENTE CON MODIFICACIONES ============
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const checkoutProductos = document.getElementById('checkout-productos');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutImpuestos = document.getElementById('checkout-impuestos');
    const checkoutEnvio = document.getElementById('checkout-envio');
    const checkoutTotal = document.getElementById('checkout-total');
    const metodoEntrega = document.getElementsByName('metodo-entrega');
    const metodoPago = document.getElementsByName('metodo-pago');
    const deliveryDireccion = document.getElementById('delivery-direccion');
    const sucursalSelect = document.getElementById('sucursal-select');
    const tarjetaData = document.getElementById('tarjeta-data');
    const confirmarPagoBtn = document.getElementById('confirmar-pago');
    
    // Mostrar nombre de usuario en checkout
const checkoutUsername = document.getElementById('checkout-username');
const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

if (usuario && checkoutUsername) {
    // Mostrar solo el primer nombre
    const primerNombre = usuario.nombre.split(' ')[0];
    checkoutUsername.textContent = `Bienvenido, ${primerNombre}`;
    
    // Opcional: Mostrar nombre completo al hacer hover
    checkoutUsername.title = usuario.nombre;
} else {
    console.warn('No se encontró información de usuario');
}

    // Variables para cálculos
    let subtotal = 0;
    let impuestos = 0;
    let envio = 0;
    let total = 0;
    
    // Mostrar productos en el resumen
    function mostrarProductos() {
        checkoutProductos.innerHTML = '';
        
        if (carrito.length === 0) {
            checkoutProductos.innerHTML = '<p>No hay productos en el carrito</p>';
            window.location.href = 'productos.html';
            return;
        }
        
        carrito.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-checkout';
            
            const precioTotalProducto = producto.precio * producto.cantidad;
            subtotal += precioTotalProducto;
            
            productoElement.innerHTML = `
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <p class="producto-precio">S/ ${(precioTotalProducto).toFixed(2)}</p>
                </div>
            `;
            
            checkoutProductos.appendChild(productoElement);
        });
        
        calcularTotales();
    }
    
    // Calcular totales
    function calcularTotales() {
        impuestos = subtotal * 0.18;
        total = subtotal + impuestos + envio;
        
        checkoutSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        checkoutImpuestos.textContent = `S/ ${impuestos.toFixed(2)}`;
        checkoutEnvio.textContent = `S/ ${envio.toFixed(2)}`;
        checkoutTotal.textContent = `S/ ${total.toFixed(2)}`;
    }
    
    // Manejar cambios en el método de entrega
    metodoEntrega.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'delivery') {
                deliveryDireccion.style.display = 'block';
                sucursalSelect.style.display = 'none';
                envio = 5.00;
            } else {
                deliveryDireccion.style.display = 'none';
                sucursalSelect.style.display = 'block';
                envio = 0.00;
            }
            calcularTotales();
        });
    });
    
    // Manejar cambios en el método de pago
    metodoPago.forEach(radio => {
        radio.addEventListener('change', function() {
            tarjetaData.style.display = this.value === 'tarjeta' ? 'block' : 'none';
        });
    });
    
    // Manejar el botón de confirmar pago (con verificación de autenticación)
    confirmarPagoBtn.addEventListener('click', function() {
        // Verificar autenticación nuevamente por seguridad
        if (!AuthManager.verificarAutenticacion()) {
            alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
            window.location.href = 'productos.html';
            return;
        }
        
        if (carrito.length === 0) {
            alert('No hay productos en el carrito');
            window.location.href = 'productos.html';
            return;
        }
        
        // Validar dirección si es delivery
        const metodoEntregaSeleccionado = document.querySelector('input[name="metodo-entrega"]:checked').value;
        if (metodoEntregaSeleccionado === 'delivery') {
            const direccion = document.getElementById('direccion').value.trim();
            if (!direccion) {
                alert('Por favor ingresa una dirección de entrega');
                return;
            }
        }
        
        // Validar método de pago
        const metodoPagoSeleccionado = document.querySelector('input[name="metodo-pago"]:checked');
        if (!metodoPagoSeleccionado) {
            alert('Por favor selecciona un método de pago');
            return;
        }
        
        // Crear objeto de pedido con información del usuario
        const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
        const pedido = {
            fecha: new Date().toISOString(),
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono
            },
            productos: carrito,
            subtotal: subtotal,
            impuestos: impuestos,
            envio: envio,
            total: total,
            metodoEntrega: metodoEntregaSeleccionado,
            metodoPago: metodoPagoSeleccionado.value,
            estado: 'pendiente'
        };
        
        if (metodoEntregaSeleccionado === 'delivery') {
            pedido.direccion = document.getElementById('direccion').value.trim();
        } else {
            pedido.sucursal = document.getElementById('sucursal').value;
        }
        
        // Guardar el pedido
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        pedidos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        // Limpiar y redirigir
        localStorage.removeItem('carrito');
        alert('¡Pedido realizado con éxito! Gracias por tu compra.');
        window.location.href = 'index.html';
    });
    
    // Inicializar
    mostrarProductos();
    
    // Actualizar contador del carrito
    function actualizarContadorCarrito() {
        const contador = document.getElementById('contador-carrito');
        contador.textContent = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    }
    
    actualizarContadorCarrito();
});