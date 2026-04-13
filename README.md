# Grand Master Trivia Engine

> CSI 3150 W26 — Final Project | Option 3

**Live URL:** `https://grand-master-trivia-engine.vercel.app` *(replace after deployment)*

**GitHub:** `https://github.com/YOUR_USERNAME/grand-master-trivia-engine` *(replace with your repo)*

---

## Overview

The Grand Master Trivia Engine is a gamified, time-pressured quiz application built with React. Players choose a knowledge domain and difficulty, then race against a 15-second per-question countdown to answer 10 questions fetched live from the Open Trivia DB API. Scores are persisted in localStorage and displayed in a Hall of Fame leaderboard.

The app features three clearly-managed game states (START_SCREEN → QUIZ_ACTIVE → RESULTS_SCREEN), Web Audio API generated sound effects, CSS animation feedback (green flash for correct, red shake for wrong), and a Fisher-Yates shuffle ensuring unique answer orderings every run.

---

## Component Tree

```
App
├── [START_SCREEN]  StartScreen
│   ├── Config form (name, category, difficulty)
│   ├── Loading spinner
│   ├── Error banner
│   └── Leaderboard (from localStorage)
│
├── [QUIZ_ACTIVE]   QuizActive
│   ├── Top bar (question counter, difficulty badge, score)
│   ├── Progress bar
│   ├── Timer (SVG arc + bar, 15 s countdown)
│   ├── Category label
│   ├── Question card
│   ├── Answer buttons × 4 (shuffled via Fisher-Yates)
│   └── Timeout banner (conditional)
│
└── [RESULTS_SCREEN] ResultsScreen
    ├── Grade hero (icon, badge, score ring, percentage)
    ├── Stats strip (correct / wrong / accuracy)
    ├── Hall of Fame leaderboard (from localStorage)
    └── Play Again button
```

---

## Technical Challenges

### 1. Timer cleanup preventing memory leaks
The 15-second countdown uses `setInterval` inside a `useEffect`. The critical requirement is returning a **cleanup function** (`return () => clearInterval(interval)`) so the interval is destroyed when the component unmounts or when dependencies change. Without this, stale intervals would fire callbacks on unmounted components, causing errors and memory leaks.

```js
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000);
  return () => clearInterval(interval); // CLEANUP
}, [currentIndex, selectedAnswer]);
```

### 2. HTML entity decoding
The OTDB API encodes special characters as HTML entities (`&#039;`, `&amp;`, `&quot;`). A `decodeHTML()` utility using a hidden `<textarea>` element resolves them into readable text before rendering.

### 3. Fisher-Yates shuffle for unbiased answer ordering
A naive `array.sort(() => Math.random() - 0.5)` produces biased permutations. The Fisher-Yates algorithm iterates backwards through the array swapping each element with a randomly chosen earlier element, guaranteeing uniform distribution.

### 4. Web Audio API for zero-dependency sounds
All sound effects (correct chord, wrong buzz, timer tick, results fanfare) are synthesised programmatically via the `AudioContext` API — no external audio files are required, keeping the bundle lightweight.

### 5. localStorage leaderboard persistence
After every quiz the top-5 scores are sorted by accuracy percentage and saved with `JSON.stringify` / `localStorage.setItem`. On mount, the `StartScreen` reads them back with `JSON.parse(localStorage.getItem(...) || '[]')` to populate the Hall of Fame.

---

## Features Checklist

### Detailed Requirements
- [x] Dynamic API Fetching — Open Trivia DB, user-selected category + difficulty
- [x] 15-second countdown timer with auto-advance on timeout
- [x] Three game states: `START_SCREEN`, `QUIZ_ACTIVE`, `RESULTS_SCREEN`
- [x] Fisher-Yates shuffle for randomised answer ordering

### Advanced Features
- [x] Sound & Visuals — Web Audio API tones; green flash (correct) and red shake (wrong) CSS animations
- [x] High-Score Leaderboard — Top 5 scores persisted in `localStorage`, shown on Start & Results screens

### Error Handling
- [x] Loading spinner while fetching questions
- [x] User-facing error messages (network failure, insufficient questions for category/difficulty)
- [x] HTML entity decoding for API responses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (CRA) |
| Styling | Custom CSS (CSS variables, Flexbox, Grid) |
| Fonts | Google Fonts — Orbitron + Rajdhani |
| API | Open Trivia DB (no key required) |
| Audio | Web Audio API (no external files) |
| Persistence | localStorage |
| Deployment | Vercel |

---

## Setup & Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/grand-master-trivia-engine.git
cd grand-master-trivia-engine

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app runs on `http://localhost:3000` by default.

---

## Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Vercel auto-detects Create React App — click **Deploy**.
4. Your live URL will be `https://your-project-name.vercel.app`.
