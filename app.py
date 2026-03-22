from flask import Flask, render_template
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

app = Flask(__name__)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)