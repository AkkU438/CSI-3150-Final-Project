import React, { useState, useEffect } from 'react';
import './App.css';

// --- Utility Functions ---
// Fisher-Yates Shuffle Algorithm [cite: 35]
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function App() {
  // Game Loop (State Flow) [cite: 34]
  // States: START_SCREEN, QUIZ_ACTIVE, RESULTS_SCREEN [cite: 35]
  const [gameState, setGameState] = useState('START_SCREEN'); 
  
  // Trivia Data
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Settings
  const [category, setCategory] = useState('9'); // Default to General Knowledge
  const [difficulty, setDifficulty] = useState('easy');
  
  // UI States
  const [loading, setLoading] = useState(false); // 
  const [error, setError] = useState(null); // 
  const [leaderboard, setLeaderboard] = useState([]); // [cite: 38]

  // Load Leaderboard on Mount
  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('triviaLeaderboard')) || []; // [cite: 60]
    setLeaderboard(savedScores);
  }, []);

  // API Fetch Function [cite: 31, 72, 73]
  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`); // [cite: 56]
      const data = await response.json();
      
      if (data.results.length === 0) {
        throw new Error("No questions found for this category/difficulty.");
      }

      // Format questions and shuffle answers [cite: 35]
      const formattedQuestions = data.results.map((q) => ({
        ...q,
        answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameState('QUIZ_ACTIVE'); // Transition state [cite: 35]
    } catch (_err) {
      setError("News currently unavailable, please try again later"); // Fallback error style [cite: 57]
    } finally {
      setLoading(false);
    }
  };

  const handleQuizEnd = (finalScore) => {
    setScore(finalScore);
    setGameState('RESULTS_SCREEN'); // Transition state [cite: 35]
    
    // Leaderboard Logic [cite: 38]
    const newLeaderboard = [...leaderboard, finalScore]
      .sort((a, b) => b - a)
      .slice(0, 5); // Keep top 5 [cite: 38]
    
    setLeaderboard(newLeaderboard);
    localStorage.setItem('triviaLeaderboard', JSON.stringify(newLeaderboard)); // Persistence [cite: 61]
  };

  return (
    <div className="app-container">
      {gameState === 'START_SCREEN' && (
        <StartScreen 
          startQuiz={startQuiz} 
          loading={loading} 
          error={error}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          leaderboard={leaderboard}
        />
      )}
      {gameState === 'QUIZ_ACTIVE' && (
        <QuizActive 
          questions={questions} 
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          score={score}
          setScore={setScore}
          endQuiz={() => handleQuizEnd(score)}
        />
      )}
      {gameState === 'RESULTS_SCREEN' && (
        <ResultsScreen 
          score={score} 
          resetQuiz={() => setGameState('START_SCREEN')} 
        />
      )}
    </div>
  );
}

// --- Start Screen Component ---
function StartScreen({ startQuiz, loading, error, category, setCategory, difficulty, setDifficulty, leaderboard }) {
  return (
    <div className="start-screen">
      <h1>The Grand Master Trivia Engine</h1>
      
      <div className="settings">
        {/* API dynamic selection [cite: 31] */}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="9">General Knowledge</option>
          <option value="17">Science & Nature</option>
          <option value="23">History</option>
          <option value="11">Film</option>
        </select>
        
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>} {/* Error Handling  */}
      
      <button onClick={startQuiz} disabled={loading}>
        {loading ? 'Loading...' : 'Start Game'} {/* Loading State  */}
      </button>

      {/* High-Score Leaderboard [cite: 38] */}
      <div className="leaderboard">
        <h3>Top 5 High Scores</h3>
        <ul>
          {leaderboard.map((s, idx) => (
            <li key={idx}>Rank {idx + 1}: {s} points</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Quiz Active Component ---
function QuizActive({ questions, currentQuestionIndex, setCurrentQuestionIndex, score, setScore, endQuiz }) {
  const [timeLeft, setTimeLeft] = useState(15); // 15-Second Pressure Timer [cite: 32]
  const [feedbackClass, setFeedbackClass] = useState(''); // Sound & Visuals 
  
  const question = questions[currentQuestionIndex];

  const handleAnswer = (selectedAnswer) => {
    const isCorrect = selectedAnswer === question.correct_answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedbackClass('flash-green'); // Visual feedback 
      const audio = new Audio('/correct-sound.mp3'); 
      audio.play().catch(e => console.log('Audio play failed', e)); // Trigger correct sound 
    } else {
      setFeedbackClass('shake-red'); // Visual feedback 
    }

    setTimeout(() => {
      setFeedbackClass('');
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(15); // Reset timer for next question [cite: 32]
      } else {
        endQuiz();
      }
    }, 800); // Small delay to let animation play
  };

  // Timer Effect
  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswer(null); // Mark wrong and transition automatically [cite: 33]
      return;
    }
    
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId); // Cleanup function to prevent memory leaks [cite: 9, 40]
  }, [timeLeft]);

  return (
    <div className={`quiz-active ${feedbackClass}`}>
      <h2>Time Left: {timeLeft}s</h2> {/* Countdown Timer [cite: 32] */}
      <h3 dangerouslySetInnerHTML={{ __html: question.question }} />
      
      <div className="answers-grid">
        {question.answers.map((answer, index) => (
          <button 
            key={index} 
            onClick={() => handleAnswer(answer)}
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        ))}
      </div>
      <p>Score: {score}</p>
    </div>
  );
}

// --- Results Screen Component ---
function ResultsScreen({ score, resetQuiz }) {
  return (
    <div className="results-screen">
      <h2>Game Over!</h2>
      <p>Your Final Score: {score}</p>
      <button onClick={resetQuiz}>Play Again</button>
    </div>
  );
}