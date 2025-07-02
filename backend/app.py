from flask import Flask
from flask_cors import CORS
from routes import setup_routes  # ✅ Import routes with /api/graph, /api/search, etc.

app = Flask(__name__)
CORS(app)

setup_routes(app)  # ✅ Register all API routes here

if __name__ == '__main__':
    app.run(debug=True)
