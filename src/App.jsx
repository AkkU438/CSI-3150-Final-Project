import React, { useState } from 'react';
import StartScreen   from './components/StartScreen';
import QuizActive    from './components/QuizActive';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

// ── Game state constants ───────────────────────────────────────────────────────
export const GAME_STATES = {
  START_SCREEN:   'START_SCREEN',
  QUIZ_ACTIVE:    'QUIZ_ACTIVE',
  RESULTS_SCREEN: 'RESULTS_SCREEN',
};

const LEADERBOARD_KEY = 'trivia_leaderboard_v1';

// ── Helper ─────────────────────────────────────────────────────────────────────
function saveToLeaderboard(name, score, total) {
  const stored  = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
  const percent = Math.round((score / total) * 100);
  const entry   = {
    name:    name.trim() || 'Anonymous',
    score,
    total,
    percent,
    date:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
  const updated = [...stored, entry]
    .sort((a, b) => b.percent - a.percent || b.score - a.score)
    .slice(0, 5);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  return updated;
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  const [gameState,  setGameState]  = useState(GAME_STATES.START_SCREEN);
  const [questions,  setQuestions]  = useState([]);
  const [score,      setScore]      = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // ── Start game: fetch questions from Open Trivia DB ────────────────────────
  const handleStart = async ({ name, category, difficulty }) => {
    setLoading(true);
    setError(null);
    setPlayerName(name);

    let url = `https://opentdb.com/api.php?amount=10&type=multiple&difficulty=${difficulty}`;
    if (category) url += `&category=${category}`;

    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.response_code === 1) {
        throw new Error('Not enough questions for this category/difficulty. Try a different combination.');
      }
      if (data.response_code !== 0) {
        throw new Error('The trivia server returned an unexpected error. Please try again.');
      }

      setQuestions(data.results);
      setScore(0);
      setGameState(GAME_STATES.QUIZ_ACTIVE);
    } catch (err) {
      setError(err.message || 'Failed to load questions. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Quiz complete: save score and transition ───────────────────────────────
  const handleQuizComplete = (finalScore) => {
    setScore(finalScore);
    saveToLeaderboard(playerName, finalScore, questions.length);
    setGameState(GAME_STATES.RESULTS_SCREEN);
  };

  // ── Restart ────────────────────────────────────────────────────────────────
  const handleRestart = () => {
    setGameState(GAME_STATES.START_SCREEN);
    setQuestions([]);
    setScore(0);
    setError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Background layers */}
      <div className="bg-grid"     aria-hidden="true" />
      <div className="bg-glow-1"   aria-hidden="true" />
      <div className="bg-glow-2"   aria-hidden="true" />
      <div className="scanlines"   aria-hidden="true" />

      {/* Ticker tape */}
      <div className="ticker" aria-hidden="true">
        <span className="ticker-inner">
          {'★ GRAND MASTER TRIVIA ENGINE ★  ·  TEST YOUR KNOWLEDGE  ·  '
            .repeat(8)}
        </span>
      </div>

      {/* Game state router */}
      <main className="app-main">
        {gameState === GAME_STATES.START_SCREEN && (
          <StartScreen
            onStart={handleStart}
            loading={loading}
            error={error}
          />
        )}
        {gameState === GAME_STATES.QUIZ_ACTIVE && (
          <QuizActive
            questions={questions}
            onComplete={handleQuizComplete}
          />
        )}
        {gameState === GAME_STATES.RESULTS_SCREEN && (
          <ResultsScreen
            score={score}
            total={questions.length}
            playerName={playerName}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
