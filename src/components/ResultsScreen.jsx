import React, { useEffect, useState } from 'react';
import { playFanfare } from '../utils/sound';
import './ResultsScreen.css';

const LEADERBOARD_KEY = 'trivia_leaderboard_v1';

const RANK_ICONS = ['👑', '🥈', '🥉', '4️⃣', '5️⃣'];

function getGrade(pct) {
  if (pct === 100) return { label: 'PERFECT',   color: '#ffd700', icon: '⭐', message: "Flawless. You are the Grand Master." };
  if (pct >= 90)  return { label: 'GENIUS',     color: '#00f5ff', icon: '🧠', message: "Extraordinary knowledge. Incredible." };
  if (pct >= 70)  return { label: 'EXPERT',     color: '#39ff14', icon: '🎯', message: "Strong performance. Well played!" };
  if (pct >= 50)  return { label: 'APPRENTICE', color: '#ffd700', icon: '📚', message: "Solid effort. Keep studying!" };
  if (pct >= 30)  return { label: 'NOVICE',     color: '#ff8c00', icon: '🌱', message: "A decent start. More to learn!" };
  return           { label: 'CHALLENGER',        color: '#ff006e', icon: '💥', message: "Tough round. Challenge yourself again!" };
}

function ResultsScreen({ score, total, playerName, onRestart }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [revealed,    setRevealed]    = useState(false);

  const pct   = Math.round((score / total) * 100);
  const grade = getGrade(pct);

  useEffect(() => {
    // Staggered reveal + fanfare
    const t1 = setTimeout(() => setRevealed(true), 200);
    const t2 = setTimeout(() => playFanfare(), 600);
    const data = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    setLeaderboard(data);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="results-screen">
      {/* ── Hero ── */}
      <div className={`results-hero ${revealed ? 'results-hero--visible' : ''}`}>
        <div className="grade-icon" style={{ textShadow: `0 0 30px ${grade.color}` }}>
          {grade.icon}
        </div>

        <div className="grade-badge" style={{ color: grade.color, borderColor: grade.color }}>
          {grade.label}
        </div>

        <h1 className="player-name-display">
          {playerName ? `${playerName}` : 'PLAYER ONE'}
        </h1>

        <div className="score-ring-wrap">
          <svg className="score-ring" viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" r="58" className="ring-bg" />
            <circle
              cx="70" cy="70" r="58"
              className="ring-fill"
              strokeDasharray={`${364.4 * pct / 100} 364.4`}
              style={{ stroke: grade.color }}
            />
          </svg>
          <div className="ring-inner">
            <span className="ring-score">{score}</span>
            <span className="ring-sep">/</span>
            <span className="ring-total">{total}</span>
          </div>
        </div>

        <p className="pct-display" style={{ color: grade.color }}>
          {pct}%
        </p>
        <p className="grade-message">{grade.message}</p>
      </div>

      {/* ── Stats strip ── */}
      <div className={`stats-strip ${revealed ? 'stats-strip--visible' : ''}`}>
        <div className="stat-item">
          <span className="stat-val stat-green">{score}</span>
          <span className="stat-label">CORRECT</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-val stat-red">{total - score}</span>
          <span className="stat-label">WRONG</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-val stat-cyan">{pct}%</span>
          <span className="stat-label">ACCURACY</span>
        </div>
      </div>

      {/* ── Leaderboard ── */}
      <div className={`results-lb ${revealed ? 'results-lb--visible' : ''}`}>
        <h2 className="lb-heading">
          <span>🏆</span> HALL OF FAME
        </h2>
        {leaderboard.length === 0 ? (
          <p className="lb-empty-msg">No records yet.</p>
        ) : (
          <ol className="results-lb-list">
            {leaderboard.map((entry, i) => (
              <li
                key={i}
                className={`rlb-entry ${entry.name === (playerName || 'Anonymous') && entry.score === score ? 'rlb-entry--you' : ''}`}
              >
                <span className="rlb-rank">{RANK_ICONS[i]}</span>
                <span className="rlb-name">{entry.name}</span>
                <span className="rlb-score">
                  <span className="rlb-frac">{entry.score}/{entry.total}</span>
                  <span className="rlb-pct">{entry.percent}%</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* ── Actions ── */}
      <div className={`results-actions ${revealed ? 'results-actions--visible' : ''}`}>
        <button className="play-again-btn" onClick={onRestart}>
          <span>↺</span> PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;
