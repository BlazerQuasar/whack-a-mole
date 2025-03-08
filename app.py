from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # 启用跨域支持

def init_db():
    conn = sqlite3.connect('game.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (username TEXT PRIMARY KEY, score INTEGER)''')
    conn.commit()
    conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    conn = sqlite3.connect('game.db')
    c = conn.cursor()
    c.execute('SELECT score FROM users WHERE username = ?', (username,))
    result = c.fetchone()
    if result:
        score = result[0]
    else:
        c.execute('INSERT INTO users (username, score) VALUES (?, 0)', (username,))
        score = 0
    conn.commit()
    conn.close()
    return jsonify({'score': score})

@app.route('/save', methods=['POST'])
def save_score():
    data = request.get_json()
    username = data['username']
    score = data['score']
    conn = sqlite3.connect('game.db')
    c = conn.cursor()
    
    # 获取用户当前最高分
    c.execute('SELECT score FROM users WHERE username = ?', (username,))
    result = c.fetchone()
    
    if result and result[0] < score:
        # 只有当新分数高于旧分数时才更新
        c.execute('UPDATE users SET score = ? WHERE username = ?', (score, username))
    elif not result:
        # 如果用户不存在，创建新记录
        c.execute('INSERT INTO users (username, score) VALUES (?, ?)', (username, score))
        
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/highscores', methods=['GET'])
def get_highscores():
    conn = sqlite3.connect('game.db')
    c = conn.cursor()
    c.execute('SELECT username, score FROM users ORDER BY score DESC LIMIT 10')
    result = c.fetchall()
    conn.close()
    
    highscores = [{'username': row[0], 'score': row[1]} for row in result]
    return jsonify({'highscores': highscores})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)