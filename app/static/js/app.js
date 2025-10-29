// Templates de los dashboards
const templates = {
    inicio: `
        <div class="top-buttons">
            <button class="btn btn-warning" id="test-api">Probar Conexión</button>
        </div>
        <div id="dashboard-inicio" class="dashboard active-dashboard">
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-content">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-3">Cargando datos por favor espere...</p>
                </div>
            </div>
            <div class="top-dashboard">
                <div class="card" id="test">
                    <h3>Flujometro</h3>
                    <div class="card-content"></div>
                </div>
                <div class="card" id="tiempo">
                    <h3>Tiempo Actual</h3>
                    <div class="card-content"></div>
                </div>
                <div class="card" id="visitas">
                    <h3>Visitas Totales</h3>
                    <div class="card-content"></div>
                </div>
            </div>
        </div>
    `,
    informes: `
        <div id="dashboard-informes" class="dashboard active-dashboard">
            <h2 class="dashboard-title">Lista de Informes</h2>
            <div class="card">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Nombre del Informe</th>
                                <th>Fecha</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody id="informes-list">
                            <!-- Se llenará dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};

// Estado de la aplicación
const appState = {
    currentView: 'inicio',
    loadingStates: {
        weather: false,
        visits: false,
        flow: false
    }
};

// Función para verificar si todos los datos están cargados
function checkAllLoaded() {
    if (appState.loadingStates.weather && 
        appState.loadingStates.visits && 
        appState.loadingStates.flow) {
        $('#loading-overlay').fadeOut();
    }
}

// Función para cargar una vista
async function loadView(viewName) {
    try {
        const contentDiv = document.getElementById('dynamic-content');
        const mainOverlay = document.getElementById('main-loading-overlay');
        
        // Mostrar overlay principal si existe
        if (mainOverlay) {
            mainOverlay.classList.add('active');
        }
        
        // Simular tiempo de carga (puedes eliminar este setTimeout en producción)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cargar el template
        contentDiv.innerHTML = templates[viewName];
        appState.currentView = viewName;
        
        // Configurar eventos para los botones del template cargado
        if (viewName === 'inicio') {
            // Inicializar la vista
            await initializeHomeView();
        } else if (viewName === 'informes') {
            await initializeReportsView();
        }
    } catch (error) {
        console.error("Error al cargar la vista:", error);
    } finally {
        // Remover el overlay principal completamente después de la carga inicial
        const mainOverlay = document.getElementById('main-loading-overlay');
        if (mainOverlay) {
            // Primero ocultamos con la animación
            mainOverlay.classList.remove('active');
            // Después de la transición, removemos el elemento
            setTimeout(() => {
                mainOverlay.remove();
            }, 300); // 300ms es el tiempo de la transición definida en CSS
        }
    }
}

// Inicializar vista de inicio
async function initializeHomeView() {
    try {
        appState.loadingStates = { weather: false, visits: false, flow: false };
        $('#loading-overlay').show();
        
        // Iniciar todas las cargas en paralelo
        const loadingPromises = [
            // Cargar visitas
            fetch("/api/visitas", { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    $("#visitas .card-content").html(
                        `<p style="font-size: 2em; text-align: center;">${data.num_visitas}</p>`
                    );
                })
                .catch(error => {
                    console.error("Error al actualizar visitas:", error);
                    $("#visitas .card-content").html(
                        '<p class="text-danger">Error al cargar datos</p>'
                    );
                })
                .finally(() => {
                    appState.loadingStates.visits = true;
                    checkAllLoaded();
                }),

            // Cargar datos del tiempo
            loadWeatherData()
        ];

        // Simulación de carga del flujómetro (reemplaza con logica real)
        loadingPromises.push(
            new Promise(resolve => {
                setTimeout(() => {
                    $("#test .card-content").html(
                        '<p style="font-size: 2em; text-align: center;">Datos del flujómetro</p>'
                    );
                    appState.loadingStates.flow = true;
                    checkAllLoaded();
                    resolve();
                }, 1500);
            })
        );

        // Esperar a que todas las cargas terminen
        await Promise.all(loadingPromises);
        
    } catch (error) {
        console.error("Error al inicializar la vista de inicio:", error);
        // Mostrar algún mensaje de error al usuario si es necesario
    }
}

// Inicializar vista de informes
async function initializeReportsView() {
    // Simular carga de informes
    const informesList = document.getElementById('informes-list');
    
    // Aquí podrías hacer un fetch real a tu API
    const mockInformes = [
        { nombre: 'Informe de Caudal - Octubre 2025', fecha: '28/10/2025' },
        { nombre: 'Informe de Caudal - Septiembre 2025', fecha: '30/09/2025' }
    ];
    
    const informesHTML = mockInformes.map(informe => `
        <tr>
            <td>${informe.nombre}</td>
            <td>${informe.fecha}</td>
            <td>
                <button class="btn btn-sm btn-primary"><i class="bi bi-download"></i> Descargar</button>
                <button class="btn btn-sm btn-secondary"><i class="bi bi-eye"></i> Ver</button>
            </td>
        </tr>
    `).join('');
    
    informesList.innerHTML = informesHTML;
}

// Inicialización cuando el documento está listo
$(document).ready(function() {
    // Activar el ítem inicial del menú
    $("#inicio").addClass("options-active");
    
    // Cargar vista inicial
    loadView('inicio');

    // Manejador de eventos para todos los items del menú
    $(".menu-item").click(function(e) {
        e.preventDefault();
        
        // Si ya está activo, no hacer nada
        if ($(this).hasClass('options-active')) {
            return;
        }

        // Obtener la vista a cargar
        const viewName = $(this).data('view');
        
        // Actualizar clases activas
        $(".options-active").removeClass("options-active");
        $(this).addClass("options-active");
        
        // Cargar la vista
        loadView(viewName);
    });
});


async function loadWeatherData() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (data && response.ok) {
            const Tiempo = document.getElementById('tiempo');

            let weatherHtml = '';
            
            // Determinar el estado del tiempo según la presión atmosférica
            if (data.bar) {
                const presion = data.bar;
                if (presion < 1000) {
                    weatherHtml = '<div style="font-size: 2em;"><i class="bi bi-cloud-rain-fill text-info"></i></div>';
                } else if (presion > 1020) {
                    weatherHtml = '<div style="font-size: 2em;"><i class="bi bi-sun-fill text-warning"></i></div>';
                } else {
                    weatherHtml = '<div style="font-size: 2em;"><i class="bi bi-cloud-sun-fill text-primary"></i></div>';
                }
            }

            // Añadir la sensación térmica
            const computed = data.computed;
            weatherHtml += `<div style="margin-top: 10px;">${computed && computed.feel !== null ? computed.feel : '-'}°C</div>`;

            $("#tiempo .card-content").html(weatherHtml);
        }
    } catch (error) {
        console.error('Error al cargar los datos meteorológicos:', error);
        $("#tiempo .card-content").html(
            `<div style="text-align: center;">
                <div style="font-size: 2em;"><i class="bi bi-exclamation-triangle-fill text-danger"></i></div>
                <div style="margin-top: 10px;">Error al cargar datos</div>
            </div>`
        );
    } finally {
        appState.loadingStates.weather = true;
        checkAllLoaded();
    }
}
