from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route('/plan', methods=['POST'])
def create_plan():
    data = request.json
    subjects = data['subjects'].split(',')  # ['Math', 'Science']
    chapters = list(map(int, data['chapters'].split(',')))  # [5, 4]
    exam_date = datetime.strptime(data['examDate'], "%Y-%m-%d")
    daily_hours = int(data['dailyHours'])

    days_left = (exam_date - datetime.today()).days
    total_chapters = sum(chapters)
    chapters_per_day = max(1, total_chapters // days_left)

    plan = []
    day = datetime.today()

    chapter_index = 0
    for i, subject in enumerate(subjects):
        for c in range(chapters[i]):
            if chapter_index % chapters_per_day == 0:
                day += timedelta(days=1)
            plan.append({
                'date': day.strftime('%Y-%m-%d'),
                'subject': subject.strip(),
                'chapter': f'Chapter {c+1}'
            })
            chapter_index += 1

    return jsonify(plan)

if __name__ == '__main__':
    app.run(debug=True)
