from app import app

from app.controllers import app_controller, api_controller

if __name__ == "__main__":
    app.run(debug=True, port=5000)

