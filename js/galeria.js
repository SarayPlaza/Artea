document.addEventListener('DOMContentLoaded', () => {
    const galeriaGrid = document.querySelector('.galeria-grid');
    const filtroButtons = document.querySelectorAll('.filtro-btn');
    let obrasDeArte = [];

    // Cargar los datos del archivo JSON
    fetch('../data/galeria.json')
        .then(response => response.json())
        .then(data => {
            obrasDeArte = data;
            mostrarObras(obrasDeArte);
        })
        .catch(error => console.error('Error al cargar la galería:', error));

    // Función para mostrar las obras de arte
function mostrarObras(obras) {
    galeriaGrid.innerHTML = ''; 
    obras.forEach(obra => {
        const cardHTML = `
            <div class="galeria-card" data-categoria="${obra.categoria}">
                <div class="imagen-hover-container">
                    <img src="${obra.imagen}" alt="${obra.nombre}" class="imagen-principal">
                    <img src="${obra.imagen_hover}" alt="${obra.nombre} - Vista Alternativa" class="imagen-hover">
                </div>
                <h3>${obra.nombre}</h3>
                <p>${obra.descripcion}</p>
            </div>
        `;
        galeriaGrid.innerHTML += cardHTML;
    });
}

    // Manejar los clicks en los botones de filtro
    filtroButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Elimino la clase 'active' de todos los botones
            filtroButtons.forEach(btn => btn.classList.remove('active'));
            // Añado la clase 'active' al botón clickeado
            button.classList.add('active');

            const categoria = button.dataset.categoria;
            let obrasFiltradas = obrasDeArte;

            if (categoria !== 'todos') {
                obrasFiltradas = obrasDeArte.filter(obra => obra.categoria === categoria);
            }

            mostrarObras(obrasFiltradas);
        });
    });
});