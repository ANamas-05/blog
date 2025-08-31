import os
from flask import request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from app import app
from flask_jwt_extended import jwt_required

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        file.path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file.path)
        file_url = f"{request.host_url}uploads/{filename}"
        return jsonify({"url": file_url})
    
    return jsonify({"msg": "File type not allowed"}), 400

@app.route('/uploads/<string:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)