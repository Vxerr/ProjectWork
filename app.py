import json
import os
from flask import Flask, jsonify, render_template, request

# Crea un'istanza dell'applicazione
app = Flask(__name__)

# Route per la homepage ("/")
@app.route("/", methods=["GET", "POST"])
def home():
    return render_template("index.html")

# Route per scrivere i dati nel file JSON, gestisce le richieste POST
@app.route("/write_database", methods=["POST"])
def write_data():

    # Definisce il percorso del file data.json nella cartella static
    file_path = os.path.join(app.static_folder, 'data.json')

    # Apre il file in modalità scrittura ("w") e salva i dati ricevuti dal form nel file JSON
    with open(file_path, "w") as file:
        json.dump(request.form, file) # request.form contiene i dati del form
        return "OK"

# Route per leggere i dati dal file JSON, gestisce le richieste GET
@app.route("/read_database", methods=["GET"])
def read_data():

    # Definisce il percorso del file data.json nella cartella static
    file_path = os.path.join(app.static_folder, 'data.json')

    # Apre il file in modalità lettura ("r") e legge i dati JSON
    with open(file_path, "r") as file:
        data = json.load(file) # Carica i dati dal file JSON
        return jsonify(data) # Restituisce i dati in formato JSON come risposta
    
# Route per cancellare i dati nel file JSON, gestisce le richieste POST
@app.route('/clear_database', methods=["POST"])
def clear_data():

    # Definisce il percorso del file data.json nella cartella static
    file_path = os.path.join(app.static_folder, 'data.json')

    # Apre il file in modalità scrittura ("w") e lo svuota scrivendo un dizionario vuoto
    with open(file_path, "w") as file:
        json.dump({}, file) # Svuota il file scrivendo un oggetto JSON vuoto
        return "OK"