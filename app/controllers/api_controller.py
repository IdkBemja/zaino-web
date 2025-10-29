
from app import app
from flask import jsonify, request, make_response
import requests
from app.utils import config
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

settings = config.load_config()

def get_arduino_token():
    """Obtiene un token de acceso para la API de Arduino IoT Cloud"""
    client_id = settings.get('CLIENT_ID')
    client_secret = settings.get('CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return None, "CLIENT_ID o CLIENT_SECRET no configurados"
    
    token_url = "https://api2.arduino.cc/iot/v1/clients/token"
    
    try:
        # Configurar el cliente OAuth2
        oauth_client = BackendApplicationClient(client_id=client_id)
        oauth = OAuth2Session(client=oauth_client)
        
        # Obtener el token
        token = oauth.fetch_token(
            token_url=token_url,
            client_id=client_id,
            client_secret=client_secret,
            include_client_id=True,
            audience="https://api2.arduino.cc/iot"
        )
        # Obtener el access token
        access_token = token.get("access_token")
        
        if not access_token:
            return None, "No se encontró access_token en la respuesta"
        
        return access_token, None
        
    except Exception as e:
        return None, f"Error de autenticación: {str(e)}"


@app.route("/api/test-api", methods=['GET'])
def test_api():
    """Endpoint para probar la conexión con la API de Arduino IoT Cloud"""
    try:
        access_token, error = get_arduino_token()

        if error:
            return jsonify({
                "error": "Error de autenticación",
                "details": error,
                "config_status": {
                    "client_id_present": bool(settings.get('CLIENT_ID')),
                    "client_secret_present": bool(settings.get('CLIENT_SECRET'))
                }
            }), 401
        
        api_url = "https://api2.arduino.cc/iot/v2/things"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        try:
            # Hacer la petición GET directamente
            response = requests.get(api_url, headers=headers)
            
            if response.status_code == 200:
                things_data = response.json()
                print(f"Consulta exitosa - {len(things_data)} things encontrados")
                print(things_data)

                return jsonify({
                    "success": True,
                    "message": "Conexión exitosa con Arduino IoT API",
                    "data": things_data
                }), 200
            else:
                return jsonify({
                    "error": "Error en la API de Arduino",
                    "status_code": response.status_code,
                    "details": response.text
                }), response.status_code

        except requests.exceptions.RequestException as e:
            return jsonify({
                "error": "Error en la petición HTTP",
                "details": str(e)
            }), 500

    except Exception as e:
        print(f"\nError inesperado: {e}")
        return jsonify({
            "error": "Error inesperado",
            "details": str(e)
        }), 500


@app.route("/api/weather")
def get_weather_empty():
    """Obtiene datos meteorológicos usando la estación por defecto configurada en .env"""
    from app.utils.weathercloud_py import WeathercloudAPI
    
    # Obtener la ID de estación desde las variables de entorno
    default_station = settings.get('WEATHERCLOUD_DEVICEID')
    if not default_station:
        return jsonify({
            "error": "No se ha configurado una estación por defecto en WEATHER_CLOUD_DEVICEID"
        }), 400
        
    try:
        weather_api = WeathercloudAPI()
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
        
    data = weather_api.get_weather(default_station)

    if "error" in data:
        if "autenticación" in data["error"].lower():
            return jsonify(data), 401
        elif "ID inválido" in data["error"]:
            return jsonify(data), 400
        return jsonify(data), 500
        
    return jsonify(data)


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