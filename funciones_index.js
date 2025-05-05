document.addEventListener("DOMContentLoaded", function() {
    // ==================== CONSTANTES Y SELECTORES ====================
    const SELECTORS = {
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

    // ==================== ELEMENTOS DEL DOM ====================
    const DOM = {
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

    // ==================== FUNCIONES DE AUTENTICACIÓN ====================
    const inicializarAuth = () => {
        // Mostrar/ocultar modales
        if (DOM.auth.loginBtn) {
            DOM.auth.loginBtn.addEventListener('click', () => DOM.auth.modals.login.style.display = 'block');
        }
        if (DOM.auth.registerBtn) {
            DOM.auth.registerBtn.addEventListener('click', () => DOM.auth.modals.register.style.display = 'block');
        }

        // Cerrar modales
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.auth.modals.login.style.display = 'none';
                DOM.auth.modals.register.style.display = 'none';
            });
        });

        // Cerrar al hacer clic fuera del modal
        window.addEventListener('click', (e) => {
            if (e.target === DOM.auth.modals.login) DOM.auth.modals.login.style.display = 'none';
            if (e.target === DOM.auth.modals.register) DOM.auth.modals.register.style.display = 'none';
        });

        // Formulario de login
        if (DOM.auth.forms.login) {
            DOM.auth.forms.login.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('#login-email').value;
                const password = e.target.querySelector('#login-password').value;
                
                try {
                    if (AuthManager.iniciarSesion(email, password)) {
                        actualizarEstadoAuth();
                        DOM.auth.modals.login.style.display = 'none';
                        mostrarNotificacion(`Bienvenido, ${AuthManager.usuarioActual.nombre.split(' ')[0]}!`);
                    }
                } catch (error) {
                    mostrarNotificacion(error.message, 'error');
                }
            });
        }

        // Formulario de registro
        if (DOM.auth.forms.register) {
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
        }

        // Cerrar sesión
        if (DOM.auth.logoutBtn) {
            DOM.auth.logoutBtn.addEventListener('click', () => {
                AuthManager.cerrarSesion();
                actualizarEstadoAuth();
                mostrarNotificacion('Sesión cerrada', 'success');
            });
        }

        actualizarEstadoAuth();
    };

    const actualizarEstadoAuth = () => {
        const autenticado = AuthManager.verificarAutenticacion();
        
        if (DOM.auth.loginBtn) DOM.auth.loginBtn.style.display = autenticado ? 'none' : 'block';
        if (DOM.auth.registerBtn) DOM.auth.registerBtn.style.display = autenticado ? 'none' : 'block';
        if (DOM.auth.logoutBtn) DOM.auth.logoutBtn.style.display = autenticado ? 'block' : 'none';
        if (DOM.auth.greeting) {
            DOM.auth.greeting.style.display = autenticado ? 'block' : 'none';
            if (autenticado) {
                DOM.auth.greeting.textContent = `Bienvenido, ${AuthManager.usuarioActual.nombre.split(' ')[0]}`;
            }
        }
    };

    // ==================== FUNCIONES EXISTENTES DEL INDEX ====================
    // Efecto zoom para imágenes
    const images = document.querySelectorAll(".zoom-img");
    images.forEach(img => {
        img.addEventListener("mouseenter", function() {
            this.style.transform = "scale(1.05)";
            this.style.transition = "transform 0.3s ease-out";
        });
        
        img.addEventListener("mouseleave", function() {
            this.style.transform = "scale(1)";
            this.style.transition = "transform 0.5s ease-in";
        });
    });

    // Validación del formulario de pedidos
    const pedidoForm = document.querySelector(".pedidos-form");
    if (pedidoForm) {
        pedidoForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            if (!AuthManager.verificarAutenticacion()) {
                mostrarNotificacion("Debes iniciar sesión para realizar pedidos", "error");
                DOM.auth.modals.login.style.display = 'block';
                return;
            }
            
            // Validar campos
            const nombre = document.getElementById("nombre").value.trim();
            const telefono = document.getElementById("telefono").value.trim();
            const producto = document.getElementById("producto").value;
            const cantidad = document.getElementById("cantidad").value;
            const fecha = document.getElementById("fecha").value;
            
            if (!nombre || !telefono || !producto || !cantidad || !fecha) {
                mostrarNotificacion("Por favor completa todos los campos", "error");
                return;
            }
            
            mostrarNotificacion("Pedido enviado con éxito. Nos pondremos en contacto contigo pronto.");
            this.reset();
        });
    }

    // Función para mostrar notificaciones (mejorada)
    function mostrarNotificacion(mensaje, tipo = "success") {
        const notificacion = document.createElement("div");
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
    }

    // ==================== INICIALIZACIÓN ====================
    inicializarAuth();
});