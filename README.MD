# 💧 Zaino Web - Flujómetro de Agua en Tiempo Real

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![Arduino IoT](https://img.shields.io/badge/Arduino-IoT%20Cloud-00979D.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Descripción

**Zaino Web** es una aplicación web desarrollada en colaboración con el **Instituto Profesional AIEP** para una comunidad que necesitaba monitorear en tiempo real el caudal de agua de un río. La solución integra hardware IoT con Arduino, sensores de flujo, y una interfaz web moderna desarrollada con Python Flask, permitiendo visualizar datos en tiempo real, estadísticas históricas y generar informes.

Este proyecto combina tecnologías de IoT, backend con Flask, y un frontend responsive para ofrecer una experiencia completa de monitoreo hídrico.

---

## ✨ Características Principales

### 🌊 Monitoreo en Tiempo Real
- **Flujo instantáneo** (L/min) con medidor visual tipo gauge
- **Flujo acumulado** total de litros
- **Gráfico histórico** de los últimos 5 minutos
- **Actualización automática** cada 10 segundos
- **Estadísticas en vivo**: máximo, mínimo y promedio

### 🌤️ Datos Meteorológicos
- Integración con **Weathercloud API**
- Temperatura y sensación térmica
- Presión atmosférica
- Indicadores visuales del clima

### 📊 Panel de Control
- **Dashboard intuitivo** con métricas clave
- **Vista responsive** para móviles, tablets y desktop
- **Sistema de caché** para optimizar peticiones
- **Gestión de informes** (descarga y visualización)

### 🎨 Interfaz Moderna
- Diseño **Material Design** con gradientes
- **Animaciones suaves** y transiciones
- **Modo oscuro** en menú lateral
- **Iconos Bootstrap** para mejor UX

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.8+**
- **Flask 2.0+** - Framework web
- **Requests** - Cliente HTTP
- **OAuth2Session** - Autenticación con Arduino IoT Cloud
- **Python-dotenv** - Gestión de variables de entorno

### Frontend
- **HTML5 / CSS3**
- **JavaScript (ES6+)**
- **jQuery 3.6**
- **Bootstrap 5.3** - Framework CSS
- **Bootstrap Icons** - Iconografía
- **SVG** - Gráficos vectoriales para visualizaciones

### APIs Integradas
- **Arduino IoT Cloud API** - Obtención de datos del flujómetro
- **Weathercloud API** - Datos meteorológicos en tiempo real

### IoT Hardware
- **Arduino** con conectividad IoT
- **Sensores de flujo** para medición de caudal
- **Comunicación en tiempo real** con Arduino IoT Cloud

---

## 📁 Estructura del Proyecto

```
zaino-web/
│
├── app/
│   ├── __init__.py
│   ├── controllers/
│   │   ├── api_controller.py      # Endpoints de la API
│   │   └── app_controller.py      # Controladores de vistas
│   ├── static/
│   │   ├── css/
│   │   │   └── app.css            # Estilos principales
│   │   ├── js/
│   │   │   ├── app.js             # Lógica principal
│   │   │   └── debug.js           # Herramientas de debug
│   │   └── img/                   # Imágenes y recursos
│   ├── templates/
│   │   └── app.html               # Template principal
│   └── utils/
│       ├── config.py              # Configuración
│       └── weathercloud_py.py     # Cliente Weathercloud
│
├── .env                           # Variables de entorno (no incluido)
├── .gitignore
├── app.py                         # Punto de entrada
├── Pipfile                        # Dependencias Pipenv
├── requirements.txt               # Dependencias pip
├── visitas.json                   # Contador de visitas
└── README.md
```

---

## ⚙️ Configuración

### 1. Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Arduino IoT Cloud Credentials
CLIENT_ID=tu_client_id_de_arduino
CLIENT_SECRET=tu_client_secret_de_arduino

# Weathercloud API Credentials
WEATHERCLOUD_EMAIL=tu_email@example.com
WEATHERCLOUD_PASSWORD=tu_password_weathercloud

# Configuración de estación meteorológica
WEATHERCLOUD_DEVICEID=ID_DE_TU_ESTACION

# Flask Security - Clave secreta (IMPORTANTE EN PRODUCCIÓN)
# Genera una con: python -c "import os; print(os.urandom(24).hex())"
SECRET_KEY=tu_clave_secreta_aleatoria_aqui
```

> **Nota de Seguridad**: Si no especificas una `SECRET_KEY`, la aplicación generará una aleatoria automáticamente. Sin embargo, esto hará que las sesiones se invaliden cada vez que reinicies el servidor. Para producción, **siempre configura una SECRET_KEY fija**.

### 2. Obtener Credenciales

#### Arduino IoT Cloud
1. Crea una cuenta en [Arduino IoT Cloud](https://cloud.arduino.cc/)
2. Ve a **API Keys** en tu panel
3. Crea un nuevo **Client ID** y **Client Secret**
4. Configura un **Thing** llamado "Medidor de Flujo" con propiedades:
   - `constflow` (float): Flujo instantáneo en L/min
   - `instflow` (float): Flujo acumulado en Litros

#### Weathercloud
1. Regístrate en [Weathercloud](https://weathercloud.net/)
2. Obtén el ID de tu estación meteorológica
3. Usa tus credenciales de login

---

## 🚀 Instalación

### Prerequisitos
- Python 3.8 o superior
- pip o pipenv
- Git

### Opción 1: Usando Pipenv (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/zaino-web.git
cd zaino-web

# Instalar pipenv si no lo tienes
pip install pipenv

# Instalar dependencias
pipenv install

# Activar el entorno virtual
pipenv shell

# Crear archivo .env y configurar variables
cp .env.example .env
# Edita el archivo .env con tus credenciales

# Ejecutar la aplicación
python app.py
```

### Opción 2: Usando pip

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/zaino-web.git
cd zaino-web

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env y configurar variables
cp .env.example .env
# Edita el archivo .env con tus credenciales

# Ejecutar la aplicación
python app.py
```

La aplicación estará disponible en: `http://localhost:5000`

---

## 🌐 Despliegue

### URL Oficial
🔗 **Producción**: [https://example.com](https://example.com)  
🔗 **Demo**: [https://demo.example.com](https://demo.example.com)

*Nota: Actualiza estas URLs con tu dominio real cuando despliegues la aplicación.*

### Despliegue en Producción

Para desplegar en producción, considera:

1. **Configurar variables de entorno** en tu servidor
2. **Usar un servidor WSGI** como Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```
3. **Configurar HTTPS** con Let's Encrypt
4. **Usar un proxy reverso** como Nginx
5. **Configurar CORS** según tus necesidades

---

## 📊 API Endpoints

### Flujómetro
- `GET /api/arduino/flowmeter` - Obtiene datos del flujómetro
- `GET /api/test-api` - Prueba conexión con Arduino IoT Cloud

### Clima
- `GET /api/weather` - Datos de estación por defecto
- `GET /api/weather/<station_id>` - Datos de estación específica
- `GET /api/weather/nearest?lat={lat}&lon={lon}&radius={radius}` - Estaciones cercanas
- `GET /api/weather/profile/<station_id>` - Perfil de estación
- `GET /api/weather/statistics/<station_id>` - Estadísticas de estación

### Utilidades
- `POST /api/visitas` - Incrementa contador de visitas

---

## 🎯 Características Técnicas

### Sistema de Caché
- **TTL**: 8 segundos para datos del flujómetro
- **Reducción**: ~95% menos peticiones a Arduino IoT Cloud
- **Fallback automático** en caso de rate limiting (429)

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: 480px, 768px, 1024px
- **Adaptación automática** de layout en tablets y móviles
- **Touch-friendly** para dispositivos táctiles

### Optimizaciones
- **Lazy loading** de datos
- **Debouncing** en resize events
- **Peticiones controladas** para evitar rate limiting
- **Animaciones con CSS** para mejor rendimiento

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Desarrollo**: En colaboración con Instituto Profesional AIEP
- **Comunidad**: Proyecto desarrollado para monitoreo comunitario de recursos hídricos

---

## 📧 Contacto

Para preguntas, sugerencias o reportar problemas:

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/zaino-web/issues)
- **Email**: contacto@example.com

---

## 🙏 Agradecimientos

- Instituto Profesional AIEP por el apoyo en el desarrollo
- Arduino IoT Cloud por proporcionar la infraestructura IoT
- Weathercloud por los datos meteorológicos
- La comunidad que inspiró este proyecto

---

## 📸 Capturas de Pantalla

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)

### Vista Móvil
![Mobile](docs/screenshots/mobile.png)

### Monitoreo en Tiempo Real
![Real-time](docs/screenshots/realtime.png)

---

**Zaino Web** - Monitoreo inteligente de recursos hídricos 💧