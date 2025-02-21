from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('game.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users 
                 (username TEXT PRIMARY_KEY, score INTEGER)''')
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
    c.execute('UPDATE users SET score = ? WHERE username = ?', (score, username))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)