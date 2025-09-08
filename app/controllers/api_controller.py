
from app import app
from flask import jsonify, request
import requests
from app.utils import config

settings = config.load_config()


def get_arduino_token():
    """Obtiene un token de acceso para la API de Arduino IoT Cloud"""
    client_id = settings.get('CLIENT_ID')
    client_secret = settings.get('CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return None, "CLIENT_ID o CLIENT_SECRET no configurados"
    
    token_url = 'https://api2.arduino.cc/iot/v1/clients/token'
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret,
        'audience': 'https://api2.arduino.cc/iot'
    }
    
    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json().get('access_token'), None
    except requests.RequestException as e:
        return None, str(e)


@app.route("/api/test-api")
def test_api():
    # Obtener token de autenticación
    access_token, error = get_arduino_token()
    
    if error:
        return jsonify({"error": f"Error de autenticación: {error}"}), 401
    
    # Hacer petición a la API con el token obtenido
    apiURL = 'https://api2.arduino.cc/iot/v2'
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Puedes cambiar esto por un endpoint específico que necesites
        # Por ejemplo: apiURL + '/dashboards' para listar los dashboards
        response = requests.get(apiURL, headers=headers)
        print(f"Status code respuesta: {response.status_code}")
        print(f"Contenido respuesta: {response.text}")
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        print(f"Error en la petición: {e}")
        return jsonify({"error": str(e)}), response.status_code if hasattr(e, 'response') and e.response else 500
    

@app.route("/api/weather")
def get_weather_empty():
    """Redirecciona a la documentación o instrucciones de uso"""
    return jsonify({
        "message": "Por favor, especifica una estación o coordenadas",
        "endpoints": {
            "/api/weather/<station_id>": "Obtener datos de una estación específica",
            "/api/weather/nearest": "Obtener estaciones cercanas (requiere lat, lon, radius)",
            "/api/weather/profile/<station_id>": "Obtener perfil de una estación",
            "/api/weather/statistics/<station_id>": "Obtener estadísticas de una estación"
        }
    })


@app.route("/api/weather/<station_id>")
def get_weather_station(station_id):
    """Obtiene datos meteorológicos de una estación específica de Weathercloud"""
    from app.utils.weathercloud_py import WeathercloudAPI
    weather_api = WeathercloudAPI()
    
    data = weather_api.get_weather(station_id)
    return jsonify(data)


@app.route("/api/weather/nearest")
def get_nearest_stations():
    """Obtiene estaciones meteorológicas cercanas a las coordenadas especificadas"""
    try:
        from app.utils.weathercloud_py import WeathercloudAPI
        weather_api = WeathercloudAPI()
        
        lat = float(request.args.get('lat', 0))
        lon = float(request.args.get('lon', 0))
        radius = int(request.args.get('radius', 10))
        
        stations = weather_api.get_nearest(lat, lon, radius)
        return jsonify(stations)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/weather/profile/<station_id>")
def get_station_profile(station_id):
    """Obtiene el perfil de una estación meteorológica"""
    from app.utils.weathercloud_py import WeathercloudAPI
    weather_api = WeathercloudAPI()
    
    data = weather_api.get_profile(station_id)
    return jsonify(data)


@app.route("/api/weather/statistics/<station_id>")
def get_station_statistics(station_id):
    """Obtiene estadísticas de una estación meteorológica"""
    from app.utils.weathercloud_py import WeathercloudAPI
    weather_api = WeathercloudAPI()
    
    data = weather_api.get_statistics(station_id)
    return jsonify(data)


@app.route("/api/visitas", methods=['POST'])
def add_visitas():
    """Añade una visita"""
    num_visitas = config.incrementar_visitas()
    return jsonify({"num_visitas": num_visitas})