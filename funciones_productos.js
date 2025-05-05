// Función abrirModal modificada
function abrirModal(titulo, imagenPrincipal, imagenesCarrusel, descripcion, ingredientes, precio) {
    console.log('Abriendo modal para:', titulo);
    console.log('Ingredientes recibidos:', ingredientes); // Para depuración
    
    document.getElementById('modalTitulo').innerText = titulo;
    document.getElementById('imagenPrincipal').src = imagenPrincipal;
    document.getElementById('modalDescripcion').innerText = descripcion;
    document.getElementById('modalPrecio').innerText = precio.toFixed(2);
  
    // Limpiar ingredientes - Versión segura
    const listaIngredientes = document.getElementById('modalIngredientes');
    listaIngredientes.innerHTML = '';
    
    // Asegurarnos que ingredientes sea un array
    const ingredientesArray = Array.isArray(ingredientes) ? ingredientes : 
                            (typeof ingredientes === 'string' ? [ingredientes] : 
                            ['No especificados']);
    
    ingredientesArray.forEach(ing => {
        const li = document.createElement('li');
        li.innerText = ing;
        listaIngredientes.appendChild(li);
    });
  
    // Resto del código del modal...
    const carrusel = document.getElementById('carruselMiniaturas');
    carrusel.innerHTML = '';
    
    // Filtramos imágenes que no existan
    const imagenesValidas = imagenesCarrusel.filter(img => {
        // Puedes implementar una verificación más robusta aquí
        return img && typeof img === 'string';
    });
    
    if(imagenesValidas.length === 0) {
        imagenesValidas.push(imagenPrincipal); // Al menos la imagen principal
    }
    
    imagenesValidas.forEach(img => {
        const mini = document.createElement('img');
        mini.src = img;
        mini.onerror = () => mini.style.display = 'none';
        mini.onclick = () => cambiarImagenPrincipal(img);
        carrusel.appendChild(mini);
    });
  
    // Mostrar modal
    document.getElementById('modalProducto').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cambiarImagenPrincipal(src) {
    document.getElementById('imagenPrincipal').src = src;
}

function cerrarModal() {
    document.getElementById('modalProducto').style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener("DOMContentLoaded", () => {
    // ==================== CONSTANTES Y SELECTORES ====================
    const SELECTORS = {
        carrito: {
            lista: "#carrito-lista",
            total: "#carrito-total",
            vacio: "#carrito-vacio",
            contador: "#contador-carrito",
            container: ".carrito-container",
            icono: "#carrito-icono",
            vaciarBtn: "#vaciar-carrito",
            comprarBtn: "#comprar-ahora"
        },
        productos: {
            botones: ".producto-btn",
            card: ".producto-card",
            cantidad: ".cantidad",
            controles: ".cantidad-btn",
            filtros: ".filtro-btn",
            grid: ".grid-productos"
        },
        auth: {
            loginBtn: "#login-btn",
            registerBtn: "#register-btn",
            logoutBtn: "#logout-btn",
            greeting: "#user-greeting",
            modals: {
                login: "#login-modal",
                register: "#register-modal"
            },
            forms: {
                login: "#login-form",
                register: "#register-form"
            }
        }
    };

    // ==================== ESTADO INICIAL ====================
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productos = [];

    // ==================== ELEMENTOS DEL DOM ====================
    const DOM = {
        carrito: {
            lista: document.querySelector(SELECTORS.carrito.lista),
            total: document.querySelector(SELECTORS.carrito.total),
            vacio: document.querySelector(SELECTORS.carrito.vacio),
            contador: document.querySelector(SELECTORS.carrito.contador),
            container: document.querySelector(SELECTORS.carrito.container),
            icono: document.querySelector(SELECTORS.carrito.icono),
            vaciarBtn: document.querySelector(SELECTORS.carrito.vaciarBtn),
            comprarBtn: document.querySelector(SELECTORS.carrito.comprarBtn)
        },
        productos: {
            grid: document.querySelector(SELECTORS.productos.grid),
            filtros: document.querySelectorAll(SELECTORS.productos.filtros)
        },
        auth: {
            loginBtn: document.querySelector(SELECTORS.auth.loginBtn),
            registerBtn: document.querySelector(SELECTORS.auth.registerBtn),
            logoutBtn: document.querySelector(SELECTORS.auth.logoutBtn),
            greeting: document.querySelector(SELECTORS.auth.greeting),
            modals: {
                login: document.querySelector(SELECTORS.auth.modals.login),
                register: document.querySelector(SELECTORS.auth.modals.register)
            },
            forms: {
                login: document.querySelector(SELECTORS.auth.forms.login),
                register: document.querySelector(SELECTORS.auth.forms.register)
            }
        }
    };

    // ==================== CLASE PARA MANEJAR AUTENTICACIÓN ====================
    class AuthManager {
        static usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        static usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;

        static registrarUsuario(usuario) {
            if (!usuario.email.includes('@')) throw new Error('Email inválido');
            if (usuario.password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
            if (this.usuarios.some(u => u.email === usuario.email)) throw new Error('El correo ya está registrado');

            this.usuarios.push(usuario);
            localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
            this.iniciarSesion(usuario.email, usuario.password);
            return true;
        }

        static iniciarSesion(email, password) {
            const usuario = this.usuarios.find(u => u.email === email && u.password === password);
            if (!usuario) throw new Error('Credenciales incorrectas');
            
            this.usuarioActual = usuario;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            return true;
        }

        static cerrarSesion() {
            this.usuarioActual = null;
            localStorage.removeItem('usuarioActual');
        }

        static verificarAutenticacion() {
            return this.usuarioActual !== null;
        }
    }

    // ==================== CLASE PARA MANEJAR CARRITO ====================
    class CarritoManager {
        static agregarProducto(id, cantidad = 1) {
            const producto = productos.find(p => p.id === id);
            if (!producto) throw new Error('Producto no encontrado');

            const existente = carrito.find(item => item.id === id);
            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carrito.push({ ...producto, cantidad });
            }
            
            this.actualizarStorage();
            actualizarUI();
        }

        static eliminarProducto(id) {
            carrito = carrito.filter(item => item.id !== id);
            this.actualizarStorage();
            actualizarUI();
        }

        static vaciarCarrito() {
            carrito = [];
            this.actualizarStorage();
            actualizarUI();
        }

        static actualizarStorage() {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }

        static calcularTotal() {
            return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        }

        static contarItems() {
            return carrito.reduce((total, item) => total + item.cantidad, 0);
        }

        static syncCarritoBetweenTabs() {
            window.addEventListener('storage', (event) => {
                if (event.key === 'carrito') {
                    carrito = JSON.parse(event.newValue || '[]');
                    actualizarUI();
                }
            });
        }
    }

    // ==================== FUNCIONES PRINCIPALES ====================

    // 1. Cargar productos desde JSON
    const cargarProductos = async () => {
        try {
            const response = await fetch('productos.json');
            if (!response.ok) throw new Error('Error al cargar productos');
            productos = await response.json();
            
            // Generar HTML de productos
            DOM.productos.grid.innerHTML = productos.map(producto => {
                const imgNombre = producto.nombre.toLowerCase().replace(/ /g, '-');
                return `
                    <div class="producto-card" data-id="${producto.id}" data-categoria="${producto.categoria.toLowerCase()}">
                        <div class="producto-imagen" data-id="${producto.id}">
                            <img src="imagenes/${imgNombre}.png" alt="${producto.nombre}" onerror="this.src='imagenes/placeholder.png'">
                        </div>
                        <div class="producto-info">
                            <span class="producto-categoria">${producto.categoria}</span>
                            <h3 class="producto-titulo">${producto.nombre}</h3>
                            <p class="producto-descripcion">${producto.descripcion}</p>
                            <div class="producto-control">
                                <div class="cantidad-control">
                                    <button class="cantidad-btn menos">-</button>
                                    <span class="cantidad">1</span>
                                    <button class="cantidad-btn mas">+</button>
                                </div>
                                <span class="producto-precio">S/ ${producto.precio.toFixed(2)}</span>
                            </div>
                            <button class="producto-btn">Añadir al carrito</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            inicializarEventos();
            inicializarFiltros();
        } catch (error) {
            console.error(error);
            mostrarNotificacion('Error al cargar productos. Recarga la página.', 'error');
            DOM.productos.grid.innerHTML = '<p class="error-message">⚠️ No se pudieron cargar los productos. Intenta más tarde.</p>';
        }
    };

    // 2. Filtrar productos por categoría
    const filtrarProductos = (categoria) => {
        const todasLasCards = document.querySelectorAll(SELECTORS.productos.card);
        
        todasLasCards.forEach(card => {
            const cardCategoria = card.dataset.categoria;
            const mostrar = categoria === 'todos' || cardCategoria === categoria.toLowerCase();
            
            card.style.display = mostrar ? 'block' : 'none';
            setTimeout(() => {
                card.style.opacity = mostrar ? '1' : '0';
                card.style.transform = mostrar ? 'translateY(0)' : 'translateY(20px)';
            }, 10);
        });
    };

    // 3. Actualizar interfaz de usuario
    const actualizarUI = () => {
        // Limpiar lista
        DOM.carrito.lista.innerHTML = '';

        // Actualizar items
        carrito.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.nombre} x${item.cantidad}</span>
                <span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
                <button class="eliminar-item" data-id="${item.id}" aria-label="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            DOM.carrito.lista.appendChild(li);
        });

        // Actualizar totales
        DOM.carrito.total.textContent = `Total: S/ ${CarritoManager.calcularTotal().toFixed(2)}`;
        DOM.carrito.contador.textContent = CarritoManager.contarItems();

        // Toggle estados
        DOM.carrito.vacio.style.display = carrito.length ? 'none' : 'block';
        DOM.carrito.lista.style.display = carrito.length ? 'block' : 'none';
    };

    // 4. Manejar proceso de compra
    const manejarCompra = () => {
        if (!AuthManager.verificarAutenticacion()) {
            mostrarNotificacion('Debes iniciar sesión para continuar con tu compra', 'error');
            DOM.auth.modals.login.style.display = 'block';
            localStorage.setItem('carritoPendiente', JSON.stringify(carrito));
            return;
        }
        
        if (!carrito.length) {
            mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }
        
        window.location.href = 'checkout.html';
    };

    // 5. Mostrar notificaciones
    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.setAttribute('role', 'alert');
        notificacion.textContent = mensaje;

        document.body.appendChild(notificacion);
        setTimeout(() => {
            notificacion.style.opacity = '1';
            setTimeout(() => {
                notificacion.style.opacity = '0';
                setTimeout(() => notificacion.remove(), 300);
            }, 2500);
        }, 10);
    };

    // ==================== INICIALIZACIÓN DE EVENTOS ====================

    // 1. Inicializar eventos de autenticación
    const inicializarAuth = () => {
        DOM.auth.loginBtn.addEventListener('click', () => DOM.auth.modals.login.style.display = 'block');
        DOM.auth.registerBtn.addEventListener('click', () => DOM.auth.modals.register.style.display = 'block');
        
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.auth.modals.login.style.display = 'none';
                DOM.auth.modals.register.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target === DOM.auth.modals.login) DOM.auth.modals.login.style.display = 'none';
            if (e.target === DOM.auth.modals.register) DOM.auth.modals.register.style.display = 'none';
        });

        DOM.auth.forms.login.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('#login-email').value;
            const password = e.target.querySelector('#login-password').value;
            
            try {
                if (AuthManager.iniciarSesion(email, password)) {
                    actualizarEstadoAuth();
                    DOM.auth.modals.login.style.display = 'none';
                    mostrarNotificacion(`Bienvenido, ${AuthManager.usuarioActual.nombre.split(' ')[0]}!`, 'success');
                }
            } catch (error) {
                mostrarNotificacion(error.message, 'error');
            }
        });

        DOM.auth.forms.register.addEventListener('submit', (e) => {
            e.preventDefault();
            const usuario = {
                nombre: e.target.querySelector('#register-name').value,
                email: e.target.querySelector('#register-email').value,
                password: e.target.querySelector('#register-password').value,
                telefono: e.target.querySelector('#register-phone').value,
                direccion: e.target.querySelector('#register-address').value
            };
            
            try {
                if (AuthManager.registrarUsuario(usuario)) {
                    actualizarEstadoAuth();
                    DOM.auth.modals.register.style.display = 'none';
                    mostrarNotificacion('¡Registro exitoso!', 'success');
                }
            } catch (error) {
                mostrarNotificacion(error.message, 'error');
            }
        });

        DOM.auth.logoutBtn.addEventListener('click', () => {
            AuthManager.cerrarSesion();
            actualizarEstadoAuth();
            mostrarNotificacion('Sesión cerrada', 'success');
        });

        actualizarEstadoAuth();
    };

    // 2. Actualizar estado de autenticación en UI
    const actualizarEstadoAuth = () => {
        const autenticado = AuthManager.verificarAutenticacion();
        
        DOM.auth.loginBtn.style.display = autenticado ? 'none' : 'block';
        DOM.auth.registerBtn.style.display = autenticado ? 'none' : 'block';
        DOM.auth.logoutBtn.style.display = autenticado ? 'block' : 'none';
        DOM.auth.greeting.style.display = autenticado ? 'block' : 'none';
        
        if (autenticado) {
            DOM.auth.greeting.textContent = `Bienvenido, ${AuthManager.usuarioActual.nombre.split(' ')[0]}`;
        }
    };

    // 3. Inicializar eventos de productos y carrito
    const inicializarEventos = () => {
        // Event delegation para el modal de productos
        document.addEventListener('click', (e) => {
            // Manejar clicks en imágenes de productos
            if (e.target.closest('.producto-imagen')) {
                const productoId = parseInt(e.target.closest('.producto-imagen').dataset.id);
                const producto = productos.find(p => p.id === productoId);
                
                if (producto) {
                    const imgNombre = producto.nombre.toLowerCase().replace(/ /g, '-');
                    const imagenes = [
                        `imagenes/${imgNombre}.png`,
                        `imagenes/${imgNombre}-2.png`,
                        `imagenes/${imgNombre}-3.png`
                    ].filter(Boolean); // Filtra valores nulos/undefined
                    
                    // Aseguramos que los ingredientes sean un array
                    const ingredientes = Array.isArray(producto.ingredientes) ? 
                                       producto.ingredientes : 
                                       (producto.ingredientes ? [producto.ingredientes] : ['No especificados']);
                    
                    abrirModal(
                        producto.nombre,
                        imagenes[0],
                        imagenes,
                        producto.descripcion,
                        ingredientes,
                        producto.precio
                    );
                }
            }

            // Agregar al carrito
            if (e.target.closest(SELECTORS.productos.botones)) {
                const card = e.target.closest(SELECTORS.productos.card);
                const id = parseInt(card.dataset.id);
                const cantidad = parseInt(card.querySelector(SELECTORS.productos.cantidad).textContent);
                CarritoManager.agregarProducto(id, cantidad);
                mostrarNotificacion('Producto añadido al carrito', 'success');
                card.querySelector(SELECTORS.productos.cantidad).textContent = '1';
            }

            // Eliminar items del carrito
            if (e.target.closest('.eliminar-item')) {
                const id = parseInt(e.target.closest('button').dataset.id);
                CarritoManager.eliminarProducto(id);
                mostrarNotificacion('Producto eliminado', 'success');
            }

            // Controles de cantidad
            if (e.target.closest(SELECTORS.productos.controles)) {
                const btn = e.target.closest(SELECTORS.productos.controles);
                const cantidadElement = btn.parentElement.querySelector(SELECTORS.productos.cantidad);
                let cantidad = parseInt(cantidadElement.textContent);
                
                if (btn.classList.contains('mas')) {
                    cantidad++;
                } else if (btn.classList.contains('menos') && cantidad > 1) {
                    cantidad--;
                }
                
                cantidadElement.textContent = cantidad;
            }
        });

        // Eventos del carrito
        DOM.carrito.icono.addEventListener('click', () => {
            DOM.carrito.container.classList.toggle('visible');
        });
        
        DOM.carrito.vaciarBtn.addEventListener('click', () => {
            if (carrito.length) {
                CarritoManager.vaciarCarrito();
                mostrarNotificacion('Carrito vaciado', 'success');
            }
        });

        DOM.carrito.comprarBtn.addEventListener('click', manejarCompra);
    };

    // 4. Inicializar filtros de categoría
    const inicializarFiltros = () => {
        DOM.productos.filtros.forEach(filtro => {
            filtro.addEventListener('click', () => {
                DOM.productos.filtros.forEach(f => f.classList.remove('active'));
                filtro.classList.add('active');
                filtrarProductos(filtro.dataset.categoria);
            });
        });
        
        document.querySelector('.filtro-btn[data-categoria="todos"]').classList.add('active');
    };

    // ==================== INICIALIZAR APLICACIÓN ====================
    const inicializar = async () => {
        CarritoManager.syncCarritoBetweenTabs();
        await cargarProductos();
        inicializarAuth();
        actualizarUI();
    };

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalProducto')) {
            cerrarModal();
        }
    });

    inicializar();
});