// Templates de los dashboards
const templates = {
    inicio: `
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
                <div class="card" id="flujometro">
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
            <div class="bottom-dashboard">
                <div class="card" id="realtime-flow">
                    <h3>Flujo en Tiempo Real</h3>
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
    },
    realtimeInterval: null,  // Para almacenar el intervalo de actualización
    flowHistory: [],  // Para almacenar el historial de datos
    lastFlowData: null,  // Cache del último dato recibido
    requestInProgress: false  // Flag para evitar peticiones simultáneas
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
        
        // Detener el monitoreo en tiempo real si estamos saliendo de la vista de inicio
        if (appState.currentView === 'inicio' && viewName !== 'inicio') {
            stopRealtimeFlowMonitor();
        }
        
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
                        `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px;">
                            <div style="font-size: 5em; font-weight: 700; color: #2c3e50; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                ${data.num_visitas}
                            </div>
                        </div>`
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
            loadFlowmeterData()
        );

        // Esperar a que todas las cargas terminen
        await Promise.all(loadingPromises);
        
        // Iniciar el medidor en tiempo real después de cargar los datos iniciales
        startRealtimeFlowMonitor();
        
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
        { nombre: 'Informe de Caudal - Septiembre 2025', fecha: '30/09/2025' },
        { nombre: 'Informe de Caudal - Agosto 2025', fecha: '31/08/2025' }
    ];
    
    // Detectar si es móvil
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Vista de cards para móvil
        const informesHTML = mockInformes.map((informe, index) => `
            <div class="informe-card" data-index="${index}">
                <div class="informe-header">
                    <div class="informe-icon">
                        <i class="bi bi-file-earmark-text-fill"></i>
                    </div>
                    <div class="informe-info">
                        <h4>${informe.nombre}</h4>
                        <p><i class="bi bi-calendar3"></i> ${informe.fecha}</p>
                    </div>
                </div>
                <div class="informe-actions">
                    <button class="btn btn-sm btn-primary btn-block">
                        <i class="bi bi-download"></i> Descargar
                    </button>
                    <button class="btn btn-sm btn-secondary btn-block">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                </div>
            </div>
        `).join('');
        
        // Cambiar el contenedor a vista de cards
        informesList.parentElement.parentElement.classList.remove('table-responsive');
        informesList.parentElement.parentElement.classList.add('informes-grid');
        informesList.parentElement.parentElement.innerHTML = informesHTML;
    } else {
        // Vista de tabla para desktop
        const informesHTML = mockInformes.map(informe => `
            <tr>
                <td>${informe.nombre}</td>
                <td>${informe.fecha}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-primary me-2">
                        <i class="bi bi-download"></i> Descargar
                    </button>
                    <button class="btn btn-sm btn-secondary">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                </td>
            </tr>
        `).join('');
        
        informesList.innerHTML = informesHTML;
    }
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
    
    // Detectar cambio de orientación o tamaño de ventana
    let resizeTimer;
    $(window).on('resize orientationchange', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Si estamos en la vista de informes, recargar para adaptar el layout
            if (appState.currentView === 'informes') {
                initializeReportsView();
            }
        }, 250);
    });
});


async function loadWeatherData() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (data && response.ok) {
            const Tiempo = document.getElementById('tiempo');

            let weatherHtml = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px;">';
            
            // Determinar el estado del tiempo según la presión atmosférica
            if (data.bar) {
                const presion = data.bar;
                if (presion < 1000) {
                    weatherHtml += '<div style="font-size: 4.5em; margin-bottom: 15px;"><i class="bi bi-cloud-rain-fill text-info"></i></div>';
                } else if (presion > 1020) {
                    weatherHtml += '<div style="font-size: 4.5em; margin-bottom: 15px;"><i class="bi bi-sun-fill text-warning"></i></div>';
                } else {
                    weatherHtml += '<div style="font-size: 4.5em; margin-bottom: 15px;"><i class="bi bi-cloud-sun-fill text-primary"></i></div>';
                }
            }

            // Añadir la sensación térmica
            const computed = data.computed;
            const temperature = computed && computed.feel !== null ? computed.feel : '-';
            weatherHtml += `<div style="font-size: 3em; font-weight: 700; color: #2c3e50; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${temperature}°C</div>`;
            weatherHtml += '</div>';

            $("#tiempo .card-content").html(weatherHtml);
        }
    } catch (error) {
        console.error('Error al cargar los datos meteorológicos:', error);
        $("#tiempo .card-content").html(
            `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px;">
                <div style="font-size: 3.5em; color: #dc3545;"><i class="bi bi-exclamation-triangle-fill"></i></div>
                <div style="margin-top: 15px; font-size: 1em; color: #7f8c8d; text-align: center;">Error al cargar<br>datos del clima</div>
            </div>`
        );
    } finally {
        appState.loadingStates.weather = true;
        checkAllLoaded();
    }
}


async function loadFlowmeterData() {
    try {
        const response = await fetch('/api/arduino/flowmeter');
        const result = await response.json();

        if (result.success && result.data) {
            const data = result.data;
            
            // Guardar en caché para uso posterior
            appState.lastFlowData = data;
            
            // CORREGIDO: Los valores estaban al revés
            // constflow = Flujo instantáneo (L/min en tiempo real) 
            // instflow = Flujo acumulado/constante (Total de litros)
            
            const instValue = data.constflow?.value || 0;  // Flujo instantáneo
            const constValue = data.instflow?.value || 0;  // Flujo acumulado
            
            // Crear el HTML con estilo de medidor mejorado
            const flowmeterHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 15px 10px;">
                    <!-- Medidor tipo gauge para flujo instantáneo -->
                    <div style="position: relative; width: 180px; height: 110px; margin-bottom: 10px;">
                        <svg viewBox="0 0 200 120" style="width: 100%; height: 100%;">
                            <!-- Fondo del arco -->
                            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                                  fill="none" 
                                  stroke="#e8f4f8" 
                                  stroke-width="18" 
                                  stroke-linecap="round"/>
                            <!-- Arco de progreso -->
                            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                                  fill="none" 
                                  stroke="url(#gradient)" 
                                  stroke-width="18" 
                                  stroke-linecap="round"
                                  stroke-dasharray="${Math.min((instValue / 100) * 251.2, 251.2)} 251.2"
                                  style="transition: stroke-dasharray 0.5s ease;"/>
                            <!-- Definir gradiente -->
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#17a2b8;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#20c997;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <!-- Texto del valor -->
                            <text x="100" y="80" 
                                  text-anchor="middle" 
                                  style="font-size: 36px; font-weight: 700; fill: #2c3e50; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                ${instValue.toFixed(2)}
                            </text>
                            <text x="100" y="102" 
                                  text-anchor="middle" 
                                  style="font-size: 13px; fill: #7f8c8d; font-weight: 500;">
                                L/min
                            </text>
                        </svg>
                        <!-- Etiquetas de escala -->
                        <div style="position: absolute; bottom: 0px; left: 5px; font-size: 10px; color: #95a5a6; font-weight: 500;">0</div>
                        <div style="position: absolute; bottom: 0px; right: 5px; font-size: 10px; color: #95a5a6; font-weight: 500;">100</div>
                    </div>
                    
                    <!-- Separador -->
                    <div style="width: 80%; height: 1px; background: linear-gradient(to right, transparent, #d1d8dd, transparent); margin: 10px 0;"></div>
                    
                    <!-- Flujo acumulado -->
                    <div style="text-align: center;">
                        <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 6px; font-weight: 500; letter-spacing: 0.5px;">
                            <i class="bi bi-droplet-fill" style="color: #17a2b8;"></i> FLUJO ACUMULADO
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: #17a2b8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                            ${constValue.toFixed(2)} <span style="font-size: 16px; font-weight: 500; color: #7f8c8d;">L</span>
                        </div>
                    </div>
                </div>
            `;
            
            $("#flujometro .card-content").html(flowmeterHtml);
            
            console.log('Datos del flujómetro cargados:', data);
        } else {
            throw new Error(result.error || 'Error al cargar datos');
        }
    } catch (error) {
        console.error('Error al cargar datos del flujómetro:', error);
        $("#flujometro .card-content").html(
            `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px;">
                <div style="font-size: 3.5em; color: #dc3545;">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div style="margin-top: 15px; font-size: 1em; color: #7f8c8d; text-align: center;">
                    Error al cargar<br>datos del flujómetro
                </div>
            </div>`
        );
    } finally {
        appState.loadingStates.flow = true;
        checkAllLoaded();
    }
}


// Función para iniciar el monitoreo en tiempo real
function startRealtimeFlowMonitor() {
    // Limpiar intervalo anterior si existe
    if (appState.realtimeInterval) {
        clearInterval(appState.realtimeInterval);
    }
    
    // Inicializar el historial con 30 puntos (5 minutos si actualizamos cada 10 segundos)
    appState.flowHistory = new Array(30).fill(0);
    
    // Usar el último dato cargado si existe
    const initialValue = appState.lastFlowData?.constflow?.value || 0;
    updateRealtimeDisplay(initialValue);
    
    // Actualizar cada 10 segundos (reducir la frecuencia para evitar 429)
    appState.realtimeInterval = setInterval(async () => {
        // Si ya hay una petición en curso, saltar esta iteración
        if (appState.requestInProgress) {
            console.log('Petición en curso, saltando...');
            return;
        }
        
        try {
            appState.requestInProgress = true;
            
            const response = await fetch('/api/arduino/flowmeter');
            
            // Manejar error 429 (Too Many Requests)
            if (response.status === 429) {
                console.warn('⚠️ Rate limit alcanzado (429). Usando datos en caché...');
                // Usar el último dato válido
                if (appState.lastFlowData) {
                    const cachedFlow = appState.lastFlowData.constflow?.value || 0;
                    appState.flowHistory.push(cachedFlow);
                    if (appState.flowHistory.length > 30) {
                        appState.flowHistory.shift();
                    }
                    updateRealtimeDisplay(cachedFlow);
                }
                return;
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                // Guardar en caché
                appState.lastFlowData = result.data;
                
                // constflow es el valor instantáneo en L/min
                const currentFlow = result.data.constflow?.value || 0;
                
                // Agregar al historial y mantener solo los últimos 30 valores
                appState.flowHistory.push(currentFlow);
                if (appState.flowHistory.length > 30) {
                    appState.flowHistory.shift();
                }
                
                // Actualizar la visualización
                updateRealtimeDisplay(currentFlow);
            }
        } catch (error) {
            console.error('Error al actualizar flujo en tiempo real:', error);
            // En caso de error, usar datos en caché si están disponibles
            if (appState.lastFlowData) {
                const cachedFlow = appState.lastFlowData.constflow?.value || 0;
                updateRealtimeDisplay(cachedFlow);
            }
        } finally {
            appState.requestInProgress = false;
        }
    }, 10000); // Actualizar cada 10 segundos en lugar de 2
}

// Función para detener el monitoreo en tiempo real
function stopRealtimeFlowMonitor() {
    if (appState.realtimeInterval) {
        clearInterval(appState.realtimeInterval);
        appState.realtimeInterval = null;
    }
}

// Función para actualizar la visualización en tiempo real
function updateRealtimeDisplay(currentValue) {
    const maxValue = Math.max(...appState.flowHistory, 100); // Escala dinámica con mínimo de 100
    const minValue = Math.min(...appState.flowHistory, 0);
    
    // Calcular promedio
    const average = appState.flowHistory.reduce((a, b) => a + b, 0) / appState.flowHistory.length;
    
    // Crear puntos para el gráfico de línea (simplificado)
    const width = 100;
    const height = 60;
    const points = appState.flowHistory.map((value, index) => {
        const x = (index / (appState.flowHistory.length - 1)) * width;
        const y = height - ((value - minValue) / (maxValue - minValue || 1)) * height;
        return `${x},${y}`;
    }).join(' ');
    
    // Determinar color según el valor actual
    let valueColor = '#17a2b8'; // Turquesa por defecto
    if (currentValue > average * 1.5) {
        valueColor = '#28a745'; // Verde si es alto
    } else if (currentValue < average * 0.5) {
        valueColor = '#ffc107'; // Amarillo si es bajo
    }
    
    const realtimeHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 20px 30px;">
            <!-- Valor actual grande -->
            <div style="flex: 0 0 200px; text-align: center;">
                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 8px; font-weight: 500; letter-spacing: 0.5px;">
                    CAUDAL ACTUAL
                </div>
                <div style="font-size: 48px; font-weight: 700; color: ${valueColor}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1;">
                    ${currentValue.toFixed(2)}
                </div>
                <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">
                    L/min
                </div>
            </div>
            
            <!-- Separador vertical -->
            <div style="width: 2px; height: 80%; background: linear-gradient(to bottom, transparent, #d1d8dd, transparent);"></div>
            
            <!-- Gráfico de línea en tiempo real -->
            <div style="flex: 1; padding: 0 30px;">
                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; letter-spacing: 0.5px;">
                    HISTORIAL (ÚLTIMOS 5 MINUTOS)
                </div>
                <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 80px;">
                    <!-- Línea de fondo (promedio) -->
                    <line x1="0" y1="${height - ((average - minValue) / (maxValue - minValue || 1)) * height}" 
                          x2="${width}" y2="${height - ((average - minValue) / (maxValue - minValue || 1)) * height}" 
                          stroke="#e8f4f8" 
                          stroke-width="1" 
                          stroke-dasharray="2,2"/>
                    
                    <!-- Área bajo la curva -->
                    <polygon points="0,${height} ${points} ${width},${height}" 
                             fill="url(#areaGradient)" 
                             opacity="0.3"/>
                    
                    <!-- Línea del gráfico -->
                    <polyline points="${points}" 
                              fill="none" 
                              stroke="#17a2b8" 
                              stroke-width="2.5" 
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    
                    <!-- Punto actual -->
                    <circle cx="${width}" 
                            cy="${height - ((currentValue - minValue) / (maxValue - minValue || 1)) * height}" 
                            r="3.5" 
                            fill="${valueColor}" 
                            stroke="white" 
                            stroke-width="1.5"/>
                    
                    <!-- Gradiente para el área -->
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#17a2b8;stop-opacity:0.6" />
                            <stop offset="100%" style="stop-color:#17a2b8;stop-opacity:0.05" />
                        </linearGradient>
                    </defs>
                </svg>
                <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; color: #95a5a6;">
                    <span>-5min</span>
                    <span>Promedio: ${average.toFixed(2)} L/min</span>
                    <span>Ahora</span>
                </div>
            </div>
            
            <!-- Estadísticas -->
            <div style="flex: 0 0 150px; display: flex; flex-direction: column; gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 3px; font-weight: 500;">MÁXIMO</div>
                    <div style="font-size: 20px; font-weight: 700; color: #28a745;">${maxValue.toFixed(2)}</div>
                </div>
                <div style="width: 80%; height: 1px; background: #e8f4f8; margin: 0 auto;"></div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; color: #7f8c8d; margin-bottom: 3px; font-weight: 500;">MÍNIMO</div>
                    <div style="font-size: 20px; font-weight: 700; color: #ffc107;">${minValue.toFixed(2)}</div>
                </div>
            </div>
        </div>
    `;
    
    $("#realtime-flow .card-content").html(realtimeHtml);
}
