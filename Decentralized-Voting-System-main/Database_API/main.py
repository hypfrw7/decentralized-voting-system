
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DB")
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

@app.route("/")
def home():
    return "Backend server is running!"

@app.route("/login", methods=["GET"])
def login():
    voter_id = request.args.get("voter_id")
    password = request.args.get("password")
    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM voters WHERE voter_id=%s AND password=%s", (voter_id, password))
        user = cursor.fetchone()
        cursor.close()
        connection.close()
        if user:
            return jsonify({"success": True, "role": user["role"]})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    except Error as e:
        print(f"Error during login: {e}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

if __name__ == "__main__":
    print("Starting backend server on http://127.0.0.1:8000")
    app.run(host="127.0.0.1", port=8000, debug=True)