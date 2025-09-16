document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas de la tienda (Calle del Barquillo 3)
    const latitudTienda = 40.4208;
    const longitudTienda = -3.6993;

    // Se establecen los valores iniciales para la ejecutar del mapa
    const mapa = L.map('mapa').setView([latitudTienda, longitudTienda], 15);

    // Se añade una capa de openStreetmap al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // se añade un marcador en la tienda
    L.marker([latitudTienda, longitudTienda]).addTo(mapa)
        .bindPopup('<b>Nuestra tienda</b><br>Artea, Calle del Barquillo 3, Madrid.').openPopup();

    // Función para obtener la ubicación del usuario y calcula la ruta
    function calcularRuta() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((posicion) => {
                const latitudUsuario = posicion.coords.latitude;
                const longitudUsuario = posicion.coords.longitude;

                // Se elimina cualquier ruta anterior
                if (window.rutaControl) {
                    mapa.removeControl(window.rutaControl);
                }

                // Se crea un control de enrutamiento
                window.rutaControl = L.Routing.control({
                    waypoints: [
                        L.latLng(latitudUsuario, longitudUsuario), // Punto de partida: ubicación del usuario
                        L.latLng(latitudTienda, longitudTienda)  // Destino: la tienda
                    ],
                    routeWhileDragging: true,
                    show: false,
                    addWaypoints: false,
                    draggableWaypoints: false,
                    lineOptions: {
                        styles: [{ color: '#3388ff', opacity: 0.8, weight: 6 }]
                    }
                }).addTo(mapa);

                // Zoom al iniciase la ruta
                mapa.fitBounds(window.rutaControl.getPlan().getWaypoints().map(wp => wp.latLng));
            }, (error) => {
                console.error("Error de geolocalización:", error);
                alert("No pudimos obtener tu ubicación. Por favor, activa la geolocalización.");
            });
        } else {
            alert("Tu navegador no soporta la geolocalización.");
        }
    }

    // Se calcula la ruta al hacer clic en el marcador de la tienda
    mapa.on('click', calcularRuta);
});