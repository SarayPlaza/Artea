document.addEventListener('DOMContentLoaded', () => {
    // Formulario de contacto
    const nombreInput = document.getElementById('nombre');
    const apellidosInput = document.getElementById('apellidos');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');

    const errorNombre = document.getElementById('errorNombre');
    const errorApellidos = document.getElementById('errorApellidos');
    const errorTelefono = document.getElementById('errorTelefono');
    const errorEmail = document.getElementById('errorEmail');
    const errorProducto = document.getElementById('errorProducto'); 
    const errorPlazo = document.getElementById('errorPlazo');     


    // Formulario de presupuesto
    const productoSelect = document.getElementById('producto');
    const plazoInput = document.getElementById('plazo');
    const extrasCheckboxes = document.querySelectorAll('input[name="extra"]');
    const totalPresupuestoSpan = document.getElementById('totalPresupuesto');
    const aceptoCondicionesCheckbox = document.getElementById('aceptoCondiciones');
    const errorCondiciones = document.getElementById('errorCondiciones');
    const enviarPresupuestoBtn = document.getElementById('enviarPresupuesto');
    const presupuestoForm = document.getElementById('presupuestoForm');

    // Precios de los extras
    const preciosExtras = {
        marco: 50,
        envio_urgente: 30,
        certificado: 20,
        sesion_bocetos: 40
    };

    // Objeto para almacenar las obras de la galería y sus precios
    let obrasGaleria = {}; 

    // Banderas para controlar si un campo ha sido tocado o si se intentó enviar
    let nombreTocado = false;
    let apellidosTocado = false;
    let telefonoTocado = false;
    let emailTocado = false;
    let productoTocado = false;
    let plazoTocado = false;
    let condicionesTocadas = false; 

    let formularioEnviadoIntento = false; 

    // Cargar productos desde galeria.json
    async function cargarProductosGaleria() {
        try {
            const response = await fetch('../data/galeria.json'); 
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de galería.');
            }
            const data = await response.json();
            
            productoSelect.innerHTML = '<option value="">-- Selecciona una obra --</option>';

            data.forEach((obra, index) => {
                const precioObra = 100 + (index * 10); 
                obrasGaleria[obra.nombre] = precioObra; 
                
                const option = document.createElement('option');
                option.value = obra.nombre; 
                option.textContent = `${obra.nombre} (${precioObra.toFixed(2)}€)`;
                productoSelect.appendChild(option);
            });
            calcularPresupuesto(); 
        } catch (error) {
            console.error('Error al cargar los productos de la galería:', error);
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Error al cargar productos";
            productoSelect.appendChild(option);
            if (formularioEnviadoIntento || productoTocado) {
                mostrarError(productoSelect, errorProducto, 'No se pudieron cargar los productos.');
            }
        }
    }

    // Funciones de validación

    function validarNombreLogica() {
        const nombre = nombreInput.value.trim();
        const regex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/;
        return nombre !== '' && regex.test(nombre) && nombre.length <= 15;
    }

    function validarApellidosLogica() {
        const apellidos = apellidosInput.value.trim();
        const regex = /^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/;
        return apellidos !== '' && regex.test(apellidos) && apellidos.length <= 40;
    }

    function validarTelefonoLogica() {
        const telefono = telefonoInput.value.trim();
        const regex = /^[0-9]{9}$/;
        return telefono !== '' && regex.test(telefono);
    }

    function validarEmailLogica() {
        const email = emailInput.value.trim();
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return email !== '' && regex.test(email);
    }

    function validarProductoLogica() {
        return productoSelect.value !== '';
    }

    function validarPlazoLogica() {
        const plazoDias = parseInt(plazoInput.value);
        return !isNaN(plazoDias) && plazoDias >= 7 && plazoInput.value.trim() !== '';
    }

    function validarCondicionesLogica() {
        return aceptoCondicionesCheckbox.checked;
    }

    // Funciones para errores

    function mostrarError(inputElement, errorElement, mensaje) {
        if (inputElement) inputElement.classList.add('invalid');
        if (errorElement) {
            errorElement.textContent = mensaje;
            errorElement.style.display = 'block';
        }
    }

    function ocultarError(inputElement, errorElement) {
        if (inputElement) inputElement.classList.remove('invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Lógica del Presupuesto

    function calcularPresupuesto() {
        let total = 0;
        let precioBaseProducto = 0;

        const productoSeleccionadoNombre = productoSelect.value;
        if (productoSeleccionadoNombre && obrasGaleria[productoSeleccionadoNombre]) {
            precioBaseProducto = obrasGaleria[productoSeleccionadoNombre];
            total += precioBaseProducto;
        }

        const plazoDias = parseInt(plazoInput.value);
        if (productoSeleccionadoNombre && !isNaN(plazoDias) && plazoDias >= 7) {
            const plazoEstandar = 30; 
            
            if (plazoDias < plazoEstandar) {
                const diasDiferencia = plazoEstandar - plazoDias;
                total += (precioBaseProducto * 0.01 * diasDiferencia); 
            } else if (plazoDias > plazoEstandar) {
                const diasDiferencia = plazoDias - plazoEstandar;
                const maxDescuento = precioBaseProducto * 0.15; 
                total -= Math.min((precioBaseProducto * 0.005 * diasDiferencia), maxDescuento); 
            }
        }

        extrasCheckboxes.forEach(checkbox => {
            if (checkbox.checked && preciosExtras[checkbox.value]) {
                total += preciosExtras[checkbox.value];
            }
        });

        if (total < 0) total = 0;

        totalPresupuestoSpan.textContent = total.toFixed(2) + '€'; 
        
        actualizarEstadoBotonEnvio(); 
    }

    // Función para mostrar/ocultar errores en un campo específico
    function validarCampoVisual(inputElement, errorElement, validationLogicFn, errorMessages, touchedFlag) {
        if (validationLogicFn()) {
            ocultarError(inputElement, errorElement);
            return true;
        } else {
            // Solo se muestra el error si el campo ha sido tocado o si se intentó enviar el formulario
            if (touchedFlag || formularioEnviadoIntento) {
                if (inputElement.value.trim() === '') {
                    mostrarError(inputElement, errorElement, errorMessages.empty);
                } else if (errorMessages.length && inputElement.value.trim().length > inputElement.maxLength) {
                    // Esta lógica de length es para el caso de nombre/apellidos
                    mostrarError(inputElement, errorElement, errorMessages.length);
                } else {
                    mostrarError(inputElement, errorElement, errorMessages.invalid);
                }
            } else {
                ocultarError(inputElement, errorElement); 
            }
            return false;
        }
    }
    
    // Actualizar estado del botón de envío
    function actualizarEstadoBotonEnvio() {
        const esValido = validarNombreLogica() && validarApellidosLogica() && validarTelefonoLogica() && validarEmailLogica() &&
                         validarProductoLogica() && validarPlazoLogica() && validarCondicionesLogica();
        enviarPresupuestoBtn.disabled = !esValido;
    }

    // Event Listeners

    // Campos de Contacto con validación instantánea al input
    nombreInput.addEventListener('input', () => { 
        // Activa la bandera 'tocado' para que salten los errores al momento
        nombreTocado = true; 
        validarCampoVisual(nombreInput, errorNombre, validarNombreLogica, { empty: 'El nombre no puede estar vacío.', invalid: 'El nombre solo puede contener letras y espacios.', length: 'El nombre no puede exceder los 15 caracteres.' }, nombreTocado); 
        actualizarEstadoBotonEnvio();
    });
    nombreInput.addEventListener('blur', () => {
        nombreTocado = true; 
        validarCampoVisual(nombreInput, errorNombre, validarNombreLogica, { empty: 'El nombre no puede estar vacío.', invalid: 'El nombre solo puede contener letras y espacios.', length: 'El nombre no puede exceder los 15 caracteres.' }, nombreTocado);
        actualizarEstadoBotonEnvio();
    });

    apellidosInput.addEventListener('input', () => { 
        apellidosTocado = true;
        validarCampoVisual(apellidosInput, errorApellidos, validarApellidosLogica, { empty: 'Los apellidos no pueden estar vacíos.', invalid: 'Los apellidos solo pueden contener letras y espacios.', length: 'Los apellidos no pueden exceder los 40 caracteres.' }, apellidosTocado); 
        actualizarEstadoBotonEnvio();
    });
    apellidosInput.addEventListener('blur', () => {
        apellidosTocado = true;
        validarCampoVisual(apellidosInput, errorApellidos, validarApellidosLogica, { empty: 'Los apellidos no pueden estar vacíos.', invalid: 'Los apellidos solo pueden contener letras y espacios.', length: 'Los apellidos no pueden exceder los 40 caracteres.' }, apellidosTocado);
        actualizarEstadoBotonEnvio();
    });

    telefonoInput.addEventListener('input', () => { 
        telefonoTocado = true;
        validarCampoVisual(telefonoInput, errorTelefono, validarTelefonoLogica, { empty: 'El teléfono no puede estar vacío.', invalid: 'El teléfono debe contener 9 dígitos numéricos.' }, telefonoTocado); 
        actualizarEstadoBotonEnvio();
    });
    telefonoInput.addEventListener('blur', () => {
        telefonoTocado = true;
        validarCampoVisual(telefonoInput, errorTelefono, validarTelefonoLogica, { empty: 'El teléfono no puede estar vacío.', invalid: 'El teléfono debe contener 9 dígitos numéricos.' }, telefonoTocado);
        actualizarEstadoBotonEnvio();
    });

    // Email
    emailInput.addEventListener('input', () => { 
        actualizarEstadoBotonEnvio(); // Actualizar el botón mientras se escribe
    });
    emailInput.addEventListener('blur', () => {
        emailTocado = true;
        validarCampoVisual(emailInput, errorEmail, validarEmailLogica, { empty: 'El correo electrónico no puede estar vacío.', invalid: 'El formato del correo electrónico no es válido.' }, emailTocado);
        actualizarEstadoBotonEnvio();
    });

    // Campo de Producto
    productoSelect.addEventListener('change', () => {
        productoTocado = true;
        calcularPresupuesto(); 
        validarCampoVisual(productoSelect, errorProducto, validarProductoLogica, { empty: 'Debes seleccionar una obra.' }, productoTocado);
    });
    productoSelect.addEventListener('blur', () => {
        productoTocado = true;
        validarCampoVisual(productoSelect, errorProducto, validarProductoLogica, { empty: 'Debes seleccionar una obra.' }, productoTocado);
        actualizarEstadoBotonEnvio();
    });

    // Campo del Plazo 
    plazoInput.addEventListener('input', () => {
        plazoTocado = true;
        calcularPresupuesto(); 
        validarCampoVisual(plazoInput, errorPlazo, validarPlazoLogica, { empty: 'El plazo no puede estar vacío.', invalid: 'El plazo mínimo es de 7 días.' }, plazoTocado);
    });
    plazoInput.addEventListener('blur', () => {
        plazoTocado = true;
        validarCampoVisual(plazoInput, errorPlazo, validarPlazoLogica, { empty: 'El plazo no puede estar vacío.', invalid: 'El plazo mínimo es de 7 días.' }, plazoTocado);
        actualizarEstadoBotonEnvio();
    });

    // Checkboxes de Extras
    extrasCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calcularPresupuesto); 
    });

    // Checkbox de Condiciones
    aceptoCondicionesCheckbox.addEventListener('change', () => {
        condicionesTocadas = true;
        if (!validarCondicionesLogica()) {
            if (condicionesTocadas || formularioEnviadoIntento) { // Mostrar error si ha sido tocado o se intentó enviar
                mostrarError(null, errorCondiciones, 'Debes aceptar las condiciones de privacidad.');
            }
        } else {
            ocultarError(null, errorCondiciones);
        }
        actualizarEstadoBotonEnvio();
    });

    // Resetear Formulario
    document.getElementById('resetFormulario').addEventListener('click', () => {
        presupuestoForm.reset();
        
        // Resetea todas las banderas de tocado y formulario
        nombreTocado = false;
        apellidosTocado = false;
        telefonoTocado = false;
        emailTocado = false;
        productoTocado = false;
        plazoTocado = false;
        condicionesTocadas = false;
        formularioEnviadoIntento = false;
        
        // Oculta todos los mensajes de error y limpiar clases 'invalid'
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        
        calcularPresupuesto(); 
        actualizarEstadoBotonEnvio(); 
    });

    // Envío del Formulario
    presupuestoForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        formularioEnviadoIntento = true; 
        
        // Forzar todas las banderas de tocado a true para que se muestren los errores
        nombreTocado = true;
        apellidosTocado = true;
        telefonoTocado = true;
        emailTocado = true;
        productoTocado = true;
        plazoTocado = true;
        condicionesTocadas = true;

        // Forzar la validación visual de todos los campos
        validarCampoVisual(nombreInput, errorNombre, validarNombreLogica, { empty: 'El nombre no puede estar vacío.', invalid: 'El nombre solo puede contener letras y espacios.', length: 'El nombre no puede exceder los 15 caracteres.' }, true);
        validarCampoVisual(apellidosInput, errorApellidos, validarApellidosLogica, { empty: 'Los apellidos no pueden estar vacíos.', invalid: 'Los apellidos solo pueden contener letras y espacios.', length: 'Los apellidos no pueden exceder los 40 caracteres.' }, true);
        validarCampoVisual(telefonoInput, errorTelefono, validarTelefonoLogica, { empty: 'El teléfono no puede estar vacío.', invalid: 'El teléfono debe contener 9 dígitos numéricos.' }, true);
        validarCampoVisual(emailInput, errorEmail, validarEmailLogica, { empty: 'El correo electrónico no puede estar vacío.', invalid: 'El formato del correo electrónico no es válido.' }, true);
        validarCampoVisual(productoSelect, errorProducto, validarProductoLogica, { empty: 'Debes seleccionar una obra.' }, true);
        validarCampoVisual(plazoInput, errorPlazo, validarPlazoLogica, { empty: 'El plazo no puede estar vacío.', invalid: 'El plazo mínimo es de 7 días.' }, true);
        
        if (!validarCondicionesLogica()) {
            mostrarError(null, errorCondiciones, 'Debes aceptar las condiciones de privacidad.');
        } else {
            ocultarError(null, errorCondiciones);
        }

        if (validarNombreLogica() && validarApellidosLogica() && validarTelefonoLogica() && validarEmailLogica() &&
            validarProductoLogica() && validarPlazoLogica() && validarCondicionesLogica()) {
            
            const extrasSeleccionados = Array.from(extrasCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.nextSibling.textContent.trim())
                .join(', ') || 'Ninguno';

            alert(`¡Presupuesto enviado!\n\nDatos de Contacto:\nNombre: ${nombreInput.value}\nApellidos: ${apellidosInput.value}\nTeléfono: ${telefonoInput.value}\nEmail: ${emailInput.value}\n\nDetalles del Presupuesto:\nObra Seleccionada: ${productoSelect.options[productoSelect.selectedIndex].text.split('(')[0].trim()}\nPlazo: ${plazoInput.value} días\nExtras: ${extrasSeleccionados}\n\nTotal: ${totalPresupuestoSpan.textContent}\n\n¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.`);
            
            presupuestoForm.reset();
            nombreTocado = false; apellidosTocado = false; telefonoTocado = false; emailTocado = false;
            productoTocado = false; plazoTocado = false; condicionesTocadas = false;
            formularioEnviadoIntento = false;

            document.querySelectorAll('.error-message').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });
            document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
            calcularPresupuesto(); 
            actualizarEstadoBotonEnvio(); 
        } else {
            alert('Por favor, rellena y corrige todos los campos antes de enviar.');
        }
    });

    // Inicialización
    cargarProductosGaleria(); 
    calcularPresupuesto(); 
    actualizarEstadoBotonEnvio(); 
});