import React, { useState, useEffect } from 'react';
import './StartScreen.css';

const LEADERBOARD_KEY = 'trivia_leaderboard_v1';

const CATEGORIES = [
  { id: '',   label: '🌐 Any Category' },
  { id: '9',  label: '🧠 General Knowledge' },
  { id: '10', label: '📚 Entertainment: Books' },
  { id: '11', label: '🎬 Entertainment: Film' },
  { id: '12', label: '🎵 Entertainment: Music' },
  { id: '14', label: '📺 Entertainment: Television' },
  { id: '15', label: '🎮 Entertainment: Video Games' },
  { id: '17', label: '🔬 Science & Nature' },
  { id: '18', label: '💻 Science: Computers' },
  { id: '19', label: '➗ Science: Mathematics' },
  { id: '20', label: '⚡ Mythology' },
  { id: '21', label: '⚽ Sports' },
  { id: '22', label: '🌍 Geography' },
  { id: '23', label: '🏛️ History' },
  { id: '25', label: '🎨 Art' },
  { id: '27', label: '🐾 Animals' },
];

const DIFFICULTIES = [
  { value: 'easy',   label: 'EASY',   color: '#39ff14' },
  { value: 'medium', label: 'MEDIUM', color: '#ffd700' },
  { value: 'hard',   label: 'HARD',   color: '#ff006e' },
];

const RANK_ICONS = ['👑', '🥈', '🥉', '4️⃣', '5️⃣'];

function StartScreen({ onStart, loading, error }) {
  const [name,        setName]        = useState('');
  const [category,    setCategory]    = useState('');
  const [difficulty,  setDifficulty]  = useState('medium');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    setLeaderboard(data);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) onStart({ name, category, difficulty });
  };

  return (
    <div className="start-screen">
      <header className="start-header">
        <div className="logo-badge">TRIVIA</div>
        <h1 className="start-title">
          <span className="title-word">GRAND</span>
          <span className="title-word accent-pink">MASTER</span>
        </h1>
        <p className="start-subtitle">The Ultimate Quiz Engine</p>
      </header>

      <div className="start-body">
        <form className="start-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="player-name">
              <span className="label-icon">⚡</span> YOUR CALLSIGN
            </label>
            <input
              id="player-name"
              className="form-input"
              type="text"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category-select">
              <span className="label-icon">📂</span> KNOWLEDGE DOMAIN
            </label>
            <div className="select-wrapper">
              <select
                id="category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <span className="select-arrow">▾</span>
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">
              <span className="label-icon">⚠️</span> DIFFICULTY
            </span>
            <div className="difficulty-grid">
              {DIFFICULTIES.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  className={`diff-btn ${difficulty === value ? 'diff-btn--active' : ''}`}
                  style={{ '--diff-color': color }}
                  onClick={() => setDifficulty(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="start-btn" disabled={loading}>
            {loading ? (
              <span className="loading-inner">
                <span className="spinner" /> LOADING QUESTIONS...
              </span>
            ) : (
              <><span className="btn-icon">▶</span> LAUNCH QUIZ</>
            )}
          </button>
        </form>

        <aside className="leaderboard">
          <h2 className="lb-title">
            <span className="lb-title-icon">🏆</span> HALL OF FAME
          </h2>
          {leaderboard.length === 0 ? (
            <p className="lb-empty">No records yet. Be the first!</p>
          ) : (
            <ol className="lb-list">
              {leaderboard.map((entry, i) => (
                <li key={i} className={`lb-entry ${i === 0 ? 'lb-entry--first' : ''}`}>
                  <span className="lb-rank">{RANK_ICONS[i]}</span>
                  <span className="lb-name">{entry.name}</span>
                  <div className="lb-score-wrap">
                    <span className="lb-score">{entry.score}/{entry.total}</span>
                    <span className="lb-percent">{entry.percent}%</span>
                  </div>
                  <span className="lb-date">{entry.date}</span>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      <div className="rules-strip">
        <span>10 QUESTIONS</span>
        <span className="rules-sep">·</span>
        <span>15 SECONDS PER QUESTION</span>
        <span className="rules-sep">·</span>
        <span>BEAT THE CLOCK</span>
      </div>
    </div>
  );
}

export default StartScreen;