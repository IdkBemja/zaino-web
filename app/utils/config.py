import os, json

from filelock import FileLock
from dotenv import load_dotenv

def load_config():

    load_dotenv()
    # Manejar el contador de visitas
    visitas_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../visitas.json')
    visitas_path = os.path.normpath(visitas_path)

    if not os.path.exists(visitas_path):
        with open(visitas_path, 'w') as f:
            json.dump({"num_visitas": 0}, f)

    with open(visitas_path, 'r') as f:
        visitas = json.load(f)

    config = {
        "CLIENT_ID": os.getenv("CLIENT_ID"),
        "CLIENT_SECRET": os.getenv("CLIENT_SECRET"),
        "WEATHERCLOUD_EMAIL": os.getenv("WEATHERCLOUD_EMAIL"),
        "WEATHERCLOUD_PASSWORD": os.getenv("WEATHERCLOUD_PASSWORD"),
        "WEATHERCLOUD_DEVICEID": os.getenv("WEATHERCLOUD_DEVICEID"),
        "NUM_VISITAS": visitas['num_visitas']
    }
    
    return config


def incrementar_visitas():
    visitas_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../visitas.json')
    visitas_path = os.path.normpath(visitas_path)
    lock_path = visitas_path + '.lock'
    lock = FileLock(lock_path, timeout=10)  # Espera hasta 10 segundos por el lock

    with lock:
        if not os.path.exists(visitas_path):
            with open(visitas_path, 'w') as f:
                json.dump({"num_visitas": 0}, f)
        with open(visitas_path, 'r') as f:
            visitas = json.load(f)
        visitas['num_visitas'] += 1
        with open(visitas_path, 'w') as f:
            json.dump(visitas, f)
    return visitas['num_visitas']