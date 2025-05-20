from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv()  # carga variables desde .env

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("Mainpage.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("Register.html")

@app.route("/configuration")
def configuration():
    return render_template("Configuration.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "False") == "True"
    app.run(port=port, debug=debug)
