/* Carrusel de imágenes */
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    slides[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Cambia la imagen cada 5 segundos
setInterval(nextSlide, 5000); 

// Muestra la primera imagen al cargar la página
showSlide(currentSlide);

/* Sección de noticias */
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/noticias.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de noticias.');
            }
            return response.json();
        })
        .then(noticias => {
            const container = document.querySelector('.noticias-container');
            noticias.forEach(noticia => {
                const noticiaHTML = `
                    <div class="noticia-card">
                        <img src="${noticia.imagen}" alt="${noticia.titulo}">
                        <div class="noticia-contenido">
                            <h3>${noticia.titulo}</h3>
                            <p class="fecha">${noticia.fecha}</p>
                            <p>${noticia.descripcion}</p>
                        </div>
                    </div>
                `;
                container.innerHTML += noticiaHTML;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            const container = document.querySelector('.noticias-container');
            container.innerHTML = '<p>Lo sentimos, no se pudieron cargar las noticias.</p>';
        });
});

/* Novedades */
document.addEventListener('DOMContentLoaded', () => { 
    const novedadesContainer = document.querySelector('.novedades-container');

    fetch('data/novedades.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de galería para novedades.');
            }
            return response.json();
        })
        .then(obras => {
            // Poner las 3 últimas obras (las últimas obras que se agregaron en el JSON)
            const ultimasObras = obras.slice(-3); 

            ultimasObras.forEach(obra => {
                const novedadHTML = `
                    <div class="novedad-card">
                        <div class="imagen-novedad-container">
                            <img src="${obra.imagen}" alt="${obra.nombre}" class="imagen-principal">
                            ${obra.imagen_hover ? `<img src="${obra.imagen_hover}" alt="${obra.nombre} - Hover" class="imagen-hover">` : ''}
                        </div>
                        <h3>${obra.nombre}</h3>
                        <p>${obra.descripcion}</p>
                    </div>
                `;
                novedadesContainer.innerHTML += novedadHTML;
            });
        })
        .catch(error => {
            console.error('Error al cargar novedades de la galería:', error);
            novedadesContainer.innerHTML = '<p>Lo sentimos, no se pudieron cargar las novedades de la galería.</p>';
        });
});