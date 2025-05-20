import React, { useState } from "react";

const todayStr = new Date().toISOString().slice(0, 10);

function StudyPlanner() {
  const [subjects, setSubjects] = useState([
    { name: "", exam_date: todayStr, chapters: [""] },
  ]);
  const [dailyHours, setDailyHours] = useState(4);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleChapterChange = (subIndex, chapIndex, value) => {
    const newSubjects = [...subjects];
    newSubjects[subIndex].chapters[chapIndex] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { name: "", exam_date: todayStr, chapters: [""] },
    ]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const addChapter = (subIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subIndex].chapters.push("");
    setSubjects(newSubjects);
  };

  const removeChapter = (subIndex, chapIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subIndex].chapters = newSubjects[subIndex].chapters.filter(
      (_, i) => i !== chapIndex
    );
    setSubjects(newSubjects);
  };

  const submitPlan = async () => {
    setError(null);
    setSchedule(null);

    // Clean and validate input
    const cleanedSubjects = subjects
      .filter((s) => s.name.trim() !== "" && s.exam_date)
      .map((s) => ({
        name: s.name.trim(),
        exam_date: s.exam_date,
        chapters: s.chapters.filter((c) => c.trim() !== ""),
      }))
      .filter((s) => s.chapters.length > 0);

    if (cleanedSubjects.length === 0) {
      setError("Please add at least one subject with chapters.");
      return;
    }
    if (!dailyHours || dailyHours <= 0) {
      setError("Please enter valid daily study hours.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects: cleanedSubjects,
          daily_hours: dailyHours,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSchedule(data.schedule);
      } else {
        setError(data.error || "Failed to generate the schedule.");
      }
    } catch (e) {
      setError("Error connecting to server.");
    }
    setLoading(false);
  };

  // Sort dates for schedule display:
  const sortedDates = schedule
    ? Object.keys(schedule).sort((a, b) => new Date(a) - new Date(b))
    : [];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f7fa;
          color: #333;
          margin: 0;
          padding: 0 20px 40px;
        }
        h1 {
          text-align: center;
          margin-top: 30px;
          font-weight: 700;
          color: #102a43;
        }
        .container {
          max-width: 900px;
          margin: 20px auto;
          background: white;
          padding: 25px 30px;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(16, 42, 67, 0.1);
        }
        button {
          background-color: #2f80ed;
          border: none;
          color: white;
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: background-color 0.3s ease;
          margin-top: 10px;
        }
        button:hover:not(:disabled) {
          background-color: #1c60d1;
        }
        button:disabled {
          background: #a1b8f0;
          cursor: not-allowed;
        }
        input[type="text"], input[type="date"], input[type="number"] {
          padding: 8px 10px;
          font-size: 15px;
          border: 1.8px solid #ccc;
          border-radius: 6px;
          width: 100%;
          transition: border-color 0.3s ease;
        }
        input[type="text"]:focus,
        input[type="date"]:focus,
        input[type="number"]:focus {
          border-color: #2f80ed;
          outline: none;
        }
        label {
          font-weight: 600;
          margin-bottom: 6px;
          display: block;
          color: #344055;
        }
        .subject-group {
          margin-bottom: 25px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 20px;
        }
        .sub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .chapters {
          margin-top: 12px;
        }
        .chapter-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .chapter-row input {
          flex-grow: 1;
        }
        .chapter-row button {
          margin-left: 10px;
          background-color: #eb5757;
          padding: 6px 12px;
          font-size: 14px;
        }
        .chapter-row button:hover {
          background-color: #c03939;
        }
        .error {
          color: #d32f2f;
          font-weight: 700;
          margin-bottom: 14px;
          text-align: center;
        }
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 25px;
        }
        .schedule-table th,
        .schedule-table td {
          border: 1px solid #ccc;
          padding: 10px 12px;
          text-align: left;
          vertical-align: top;
          background: #fbfbfb;
        }
        .schedule-table th {
          background: #2f80ed;
          color: white;
          font-weight: 700;
        }
        .task {
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #d9e3f0;
        }
        @media (max-width: 768px) {
          .chapter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .chapter-row button {
            margin-left: 0;
            margin-top: 6px;
            align-self: flex-start;
          }
        }
      `}</style>

      <h1>Smart Study Planner</h1>
      <div className="container">
        {error && <div className="error">{error}</div>}

        <label htmlFor="dailyHours">Daily available study hours:</label>
        <input
          id="dailyHours"
          type="number"
          min="1"
          max="24"
          value={dailyHours}
          onChange={(e) => setDailyHours(+e.target.value)}
        />

        {subjects.map((sub, sIndex) => (
          <div key={sIndex} className="subject-group">
            <div className="sub-header">
              <label>Subject Name:</label>
              <button
                type="button"
                onClick={() => removeSubject(sIndex)}
                disabled={subjects.length === 1}
                title={
                  subjects.length === 1
                    ? "At least one subject is required"
                    : "Remove subject"
                }
              >
                Remove Subject
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter subject name"
              value={sub.name}
              onChange={(e) =>
                handleSubjectChange(sIndex, "name", e.target.value)
              }
            />

            <label style={{ marginTop: "12px" }}>Exam Date:</label>
            <input
              type="date"
              value={sub.exam_date}
              onChange={(e) =>
                handleSubjectChange(sIndex, "exam_date", e.target.value)
              }
              min={todayStr}
            />

            <div className="chapters">
              <label>Chapters:</label>
              {sub.chapters.map((chap, cIndex) => (
                <div className="chapter-row" key={cIndex}>
                  <input
                    type="text"
                    placeholder="Chapter name"
                    value={chap}
                    onChange={(e) =>
                      handleChapterChange(sIndex, cIndex, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeChapter(sIndex, cIndex)}
                    disabled={sub.chapters.length === 1}
                    title={
                      sub.chapters.length === 1
                        ? "At least one chapter required"
                        : "Remove chapter"
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addChapter(sIndex)}
                style={{ marginTop: "8px" }}
              >
                + Add Chapter
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addSubject}>
          + Add Subject
        </button>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={submitPlan}
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? "Generating Schedule..." : "Generate Study Plan"}
          </button>
        </div>

        {schedule && (
          <table className="schedule-table" aria-label="Study timetable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Study Topics</th>
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>
                    {schedule[date].map((task, i) => (
                      <div className="task" key={i}>
                        <strong>{task.subject}</strong>: {task.chapter} (
                        {task.hours} hr{task.hours > 1 ? "s" : ""})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default StudyPlanner;
