import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fisherYatesShuffle } from '../utils/shuffle';
import { decodeHTML }         from '../utils/html';
import { playCorrect, playWrong, playTick } from '../utils/sound';
import './QuizActive.css';

const TIMER_DURATION = 15;

function QuizActive({ questions, onComplete }) {
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selectedAnswer,  setSelectedAnswer]  = useState(null);
  const [answerResult,    setAnswerResult]    = useState(null);
  const [score,           setScore]           = useState(0);
  const [timeLeft,        setTimeLeft]        = useState(TIMER_DURATION);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const wrapperRef     = useRef(null);
  const currentQuestion = questions[currentIndex];
  const totalQuestions  = questions.length;

  // Shuffle answers on each new question
  useEffect(() => {
    if (!currentQuestion) return;
    const all = [currentQuestion.correct_answer, ...currentQuestion.incorrect_answers];
    setShuffledAnswers(fisherYatesShuffle(all));
    setSelectedAnswer(null);
    setAnswerResult(null);
    setTimeLeft(TIMER_DURATION);
    setIsTransitioning(false);
  }, [currentIndex, currentQuestion]);

  const advance = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentIndex + 1 >= totalQuestions) onComplete(score);
      else setCurrentIndex((i) => i + 1);
    }, 900);
  }, [currentIndex, totalQuestions, score, onComplete]);


    function triggerFlash() {
    const el = wrapperRef.current; if (!el) return;
    el.classList.remove('flash-green-anim', 'shake-anim');
    void el.offsetWidth;
    el.classList.add('flash-green-anim');
  }

  function triggerShake() {
    const el = wrapperRef.current; if (!el) return;
    el.classList.remove('flash-green-anim', 'shake-anim');
    void el.offsetWidth;
    el.classList.add('shake-anim');
  }


  const handleAnswer = useCallback((chosen) => {
    if (selectedAnswer !== null || isTransitioning) return;
    setSelectedAnswer(chosen);

    const isCorrect = chosen === currentQuestion.correct_answer;
    if (chosen === null) {
      setAnswerResult('timeout'); playWrong(); triggerShake();
    } else if (isCorrect) {
      setAnswerResult('correct'); setScore((s) => s + 1); playCorrect(); triggerFlash();
    } else {
      setAnswerResult('wrong'); playWrong(); triggerShake();
    }
    advance();
  }, [selectedAnswer, isTransitioning, currentQuestion, advance]);

  // 15-second countdown — cleanup function prevents memory leaks
  useEffect(() => {
    if (selectedAnswer !== null || isTransitioning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); handleAnswer(null); return 0; }
        if (prev <= 6) playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // CLEANUP
  }, [currentIndex, selectedAnswer, isTransitioning, handleAnswer]);

  function getButtonState(answer) {
    if (selectedAnswer === null) return 'default';
    if (answer === currentQuestion.correct_answer) return 'correct';
    if (answer === selectedAnswer) return 'wrong';
    return 'dim';
  }

  if (!currentQuestion) return null;

  const progress     = (currentIndex / totalQuestions) * 100;
  const timerPct     = (timeLeft / TIMER_DURATION) * 100;
  const timerWarning = timeLeft <= 5;
  const timerDanger  = timeLeft <= 3;

  return (
    <div className={`quiz-wrapper ${isTransitioning ? 'quiz-wrapper--exit' : ''}`} ref={wrapperRef}>
      {/* Top bar */}
      <div className="quiz-topbar">
        <div className="quiz-meta">
          <span className="quiz-progress-label">
            Q <span className="q-num">{currentIndex + 1}</span>
            <span className="q-sep">/</span>{totalQuestions}
          </span>
          <span className={`diff-badge diff-badge--${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty?.toUpperCase()}
          </span>
        </div>
        <div className="score-display">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Timer */}
      <div className={`timer-row ${timerWarning ? 'timer-row--warn' : ''} ${timerDanger ? 'timer-row--danger' : ''}`}>
        <div className="timer-arc-wrap">
          <svg className="timer-arc" viewBox="0 0 44 44" aria-hidden="true">
            <circle className="timer-arc-bg" cx="22" cy="22" r="18" />
            <circle
              className="timer-arc-fill" cx="22" cy="22" r="18"
              strokeDasharray={`${113.1 * timerPct / 100} 113.1`}
              style={{ stroke: timerDanger ? 'var(--neon-red)' : timerWarning ? '#ff8c00' : 'var(--neon-cyan)' }}
            />
          </svg>
          <span className="timer-count">{timeLeft}</span>
        </div>
        <div className="timer-bar-track">
          <div
            className="timer-bar-fill"
            style={{
              width: `${timerPct}%`,
              background: timerDanger ? 'var(--neon-red)' : timerWarning ? '#ff8c00' : 'var(--neon-cyan)',
              boxShadow: timerDanger ? 'var(--glow-red)' : timerWarning ? '0 0 8px rgba(255,140,0,0.6)' : 'var(--glow-cyan)',
            }}
          />
        </div>
        <span className="timer-label">SEC</span>
      </div>

      {/* Category */}
      <div className="category-label">{decodeHTML(currentQuestion.category)}</div>

      {/* Question */}
      <div className="question-card">
        <p className="question-text">{decodeHTML(currentQuestion.question)}</p>
      </div>

      {/* Answers */}
      <div className="answers-grid">
        {shuffledAnswers.map((answer, idx) => {
          const state = getButtonState(answer);
          return (
            <button
              key={idx}
              className={`answer-btn answer-btn--${state}`}
              onClick={() => handleAnswer(answer)}
              disabled={selectedAnswer !== null || isTransitioning}
            >
              <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="answer-text">{decodeHTML(answer)}</span>
              {state === 'correct' && <span className="answer-icon">✓</span>}
              {state === 'wrong'   && <span className="answer-icon">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Timeout banner */}
      {answerResult === 'timeout' && (
        <div className="timeout-banner">
          ⏱ TIME'S UP! — Correct answer: <strong>{decodeHTML(currentQuestion.correct_answer)}</strong>
        </div>
      )}
    </div>
  );
}

export default QuizActive;