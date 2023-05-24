from flask import Flask, jsonify, request, send_from_directory, render_template
import os
from werkzeug.utils import secure_filename
from flask import send_file
from flask_cors import CORS

app = Flask(__name__)

# Configurar a pasta de build do React
build_folder = os.path.join(os.getcwd(), 'my-app/build')

CORS(app, resources={r"/*": {"origins": "http://localhost:3002"}})

# Rota para servir os arquivos estáticos do React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(build_folder, path)):
        return send_from_directory(build_folder, path)
    else:
        return send_from_directory(build_folder, 'index.html')

# Rota para processar o arquivo enviado pelo frontend
@app.route('/processar', methods=['POST'])
def processar():
    # Lógica para processar o arquivo enviado pelo frontend
    file = request.files['file']

    file_name = secure_filename(file.filename)
    file_extension = os.path.splitext(file_name)[1]

    # ----------------- NEW FILE SELECTION --------------
    if file_name.endswith('.zip'):
        # Verifica se a solicitação contém o nome para salvar o novo arquivo
        if 'new_file_name' in request.form:
            new_file_name = request.form['new_file_name']
            new_file_path = os.path.join(os.getcwd(), new_file_name)

            # Salva o novo arquivo no caminho escolhido pelo usuário
            file.save(new_file_path)

            # Retorna o caminho do novo arquivo para que o frontend possa fazer o download
            response = {
                'message': 'Arquivo processado com sucesso!',
                'file_path': new_file_path
            }
            return jsonify(response)
        else:
            return jsonify({'message': 'New file name not provided'})

    else:
        return jsonify({'message': 'Invalid file format'})

# Rota para fazer o download do arquivo
@app.route('/download', methods=['GET'])
def download():
    file_path = request.args.get('file_path')
    if file_path:
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'message': 'File path not provided'})

# Configurar o cabeçalho Access-Control-Allow-Origin
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3002')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST')
    return response

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
