# My Quiz
A dynamic quiz application built with React.js and powered by the Open Trivia DB API.
This project demonstrates API integration, error handling with retries, and state-driven UI updates—all documented with reproducibility in mind.
## Feature
- Fetches quiz questions from an external API with retry logic and exponential backoff for rate limits.
- Dynamic question flow with score tracking and final results.
- Answer validation with visual feedback (correct/incorrect states).
- User-friendly error handling for API failures and rate limits.
- Clean, modular React code with hooks (`useState`, `useEffect`, `useRef`).
## Tech Stack
- React.js (with Vite for fast dev environment)
- JavaScript (ES6+)
- Open Trivia DB API
- CSS for styling
## 📂 Project Structure
```MyQuiz/
├── src/
│   ├── App.jsx        
│   ├── App.css        
│   ├── assets/        
│   └── ...
├── package.json
└── README.md
```
## ⚡ Getting Started
### Prerequisites
- Node.js (>= 16)
- `npm` or `yarn`
### Installation
```Clone the repo
    git clone https://github.com/GitHubMotiar/quiz-app.git

    Navigate into the project
    cd MyQuiz

    Install dependencies
    npm install

    Start development server
    npm run dev
```
##  Usage
- Launch the app in your browser.
- Answer multiple-choice questions.
- Submit to reveal correct/incorrect answers.
- Continue to the next question or check your final score

## Learning Highlights
This project helped me grow as both a developer and a technical writer:
- Implemented API management strategies (retry, exponential backoff).
- Documented common developer pain points (rate limits, error handling).
- Strengthened debugging practices with state tracing and logs.
- Created reproducible documentation to help others extend the project.
## Future Enhancements
- Add category/level selection for quizzes.
- Persist scores with local storage or backend integration.
- Improve UI/UX with animations and accessibility features.
## ✍️ Author
Motiar – Technical Writer & Developer
[LinkedIn](linkedin.com/in/motiar-rahaman-15488b74)
[Email](rehanrehman2013@gmail.com)


