import { useEffect, useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [quiz, setQuiz] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [userAnswers, setUserAnswers] = useState({})
    const [showResults, setShowResults] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [totalScore, setTotalScore] = useState(0)
    const fetchedRef = useRef(false) // prevents double fetch in React StrictMode

    const sleep = (ms) => new Promise(res => setTimeout(res, ms))

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        try {
            const response = await fetch(url)
            if (response.status === 429) {
                if (retries > 0) {
                    await sleep(delay)
                    return fetchWithRetry(url, retries - 1, delay * 2)
                }
                const err = new Error('Rate limit reached (429). Please try again later.')
                err.status = 429
                throw err
            }
            if (!response.ok) {
                throw new Error('Something went wrong while fetching the data')
            }
            return response.json()
        } catch (err) {
            throw err
        }
    }

    const fetchQuiz = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchWithRetry("https://opentdb.com/api.php?amount=1&category=27&type=multiple", 3, 1000)
            // create a stable shuffled answers array for each question
            const withShuffled = data.results.map(q => ({
                ...q,
                answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
            }))
            setQuiz(withShuffled)
            setCurrentQuestionIndex(0)
            console.log('fetchQuiz: loaded questions', withShuffled)
        } catch (err) {
            // show friendly message for 429
            if (err.status === 429) {
                setError('API rate limit reached. Wait a moment and refresh.')
            } else {
                setError(err.message || 'Failed to fetch quiz')
            }
            console.error("Error fetching the quiz data:", err)
        } finally {
            setLoading(false)
        }
    }

    // fetch and append a single next question
    const fetchNextQuestion = async () => {
        try {
            const data = await fetchWithRetry("https://opentdb.com/api.php?amount=1&category=27&type=multiple", 3, 1000)
            const withShuffled = data.results.map(q => ({
                ...q,
                answers: shuffleArray([...q.incorrect_answers, q.correct_answer])
            }))
            setQuiz(prev => [...prev, ...withShuffled])
            setCurrentQuestionIndex(prev => prev + 1)
            // ensure submitted is false for the newly loaded question
            setSubmitted(false)
            console.log('fetchNextQuestion: appended', withShuffled)
        } catch (err) {
            console.error('Failed to fetch next question', err)
            setError('Failed to load next question')
        }
    }

    useEffect(() => {
        if (fetchedRef.current) return
        fetchedRef.current = true
        fetchQuiz()
    }, [])
    const handleAnswerSelect = (questionIndex, answer) => {
        // debug: log selections
        console.log('handleAnswerSelect', questionIndex, answer)
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }))
    }


    const handleSubmit = (e) => {
        e.preventDefault()
        // reveal the correct answer for the current question
        setSubmitted(true)
    }

    const handleNextQuestion = async () => {
        // if user answered this question correctly, increment totalScore
        const currentQ = quiz[currentQuestionIndex]
        console.log('handleNextQuestion: currentIndex', currentQuestionIndex, 'userAnswers', userAnswers, 'currentQ.correct_answer', currentQ.correct_answer)
        if (userAnswers[currentQuestionIndex] === currentQ.correct_answer) {
            setTotalScore(prev => prev + 1)
            console.log('handleNextQuestion: incremented score')
        }
        // reset submitted state and fetch next question
        setSubmitted(false)
        await fetchNextQuestion()
    }

    // trace key state changes for debugging
    useEffect(() => {
        console.log('STATE_TRACE -> currentQuestionIndex:', currentQuestionIndex, 'submitted:', submitted, 'totalScore:', totalScore)
    }, [currentQuestionIndex, submitted, totalScore])

    const handleShowFinalScore = () => {
        // include current question correctness in final score if it was submitted
        if (submitted) {
            const currentQ = quiz[currentQuestionIndex]
            if (userAnswers[currentQuestionIndex] === currentQ.correct_answer) {
                setTotalScore(prev => prev + 1)
            }
        }
        setShowResults(true)
    }

    if (loading) {
        return (
            <div className='container'>
                <h1>Quiz App</h1>
                <p>Loading quiz..</p>
            </div>
        )
    }
    if (error) {
        return (
            <div className='container'>
                <h1>Quiz App</h1>
                <p>Error: {error}</p>
            </div>
        )
    }
    if (!quiz) {
        return (
            <div className='container'>
                <h1>Quiz App</h1>
                <p>No quiz data available.</p>
            </div>
        )
    }
    if (showResults) {
        // final results screen — use accumulated totalScore
        return (
            <div className='quiz-score'>
                <h2>Your Score</h2>
                <p>You Scored {totalScore} out of {quiz.length}</p>
                <button onClick={() => window.location.reload()}>Play Again</button>
            </div>
        )
    }

    // show only the current question, reveal correct/incorrect after submit
    const currentQ = quiz[currentQuestionIndex]
    return (
        <div className="container">
            <h1>Quiz App</h1>

            <div className="question-block">
                <h3 dangerouslySetInnerHTML={{ __html: currentQ.question }} />
                <form onSubmit={handleSubmit} className="quiz-form">
                  <ul>
                      {currentQ.answers.map((answer, answerIndex) => {
                          const isSelected = userAnswers[currentQuestionIndex] === answer
                          const isCorrect = answer === currentQ.correct_answer
                          let liClass = 'answer-option'
                          if (submitted) {
                              if (isCorrect) liClass += ' correct'
                              else if (isSelected && !isCorrect) liClass += ' incorrect'
                          }
                          return (
                              <li key={answerIndex} className={liClass}>
                                  <label className="answer-label">
                                      <input
                                          type="radio"
                                          name={`question-${currentQuestionIndex}`}
                                          value={answer}
                                          checked={isSelected}
                                          onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                                          disabled={submitted}
                                      />
                                      <span dangerouslySetInnerHTML={{ __html: answer }} />
                                  </label>
                              </li>
                          )
                      })}
                  </ul>

                  <div className="quiz-actions">
                      {!submitted ? (
                          <button type="submit">Submit</button>
                      ) : (
                          <>
                              <button type="button" onClick={handleNextQuestion}>Next Question</button>
                              <button type="button" onClick={handleShowFinalScore}>Check Final Score</button>
                          </>
                      )}
                  </div>
                </form>
            </div>
        </div>
    );
}

function shuffleArray(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default App
