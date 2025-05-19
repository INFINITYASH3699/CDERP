// components/quiz/QuizComponent.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizResult from '@/components/quiz/QuizResult';
import styles from '@/styles/quiz.module.css';

const QuizComponent = ({ quiz }) => {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit);

  useEffect(() => {
    if (timeLeft <= 0) {
      calculateScore();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionIndex, choice) => {
    const question = quiz.questions[questionIndex];
    
    if (question.type === 'MCQs' || question.type === 'boolean') {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: [choice]
      });
    } else if (question.type === 'MAQs') {
      const currentAnswers = selectedAnswers[questionIndex] || [];
      if (currentAnswers.includes(choice)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionIndex]: currentAnswers.filter(answer => answer !== choice)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionIndex]: [...currentAnswers, choice]
        });
      }
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    
    quiz.questions.forEach((question, index) => {
      const userAnswers = selectedAnswers[index] || [];
      const correctAnswers = question.correctAnswers;
      
      if (question.type === 'MCQs' || question.type === 'boolean') {
        if (userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])) {
          totalScore += question.score;
        }
      } else if (question.type === 'MAQs') {
        // Check if user selected all correct answers and no incorrect ones
        const allCorrect = correctAnswers.every(answer => userAnswers.includes(answer));
        const noIncorrect = userAnswers.every(answer => correctAnswers.includes(answer));
        
        if (allCorrect && noIncorrect) {
          totalScore += question.score;
        }
      }
    });
    
    setScore(totalScore);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (showResult) {
    return <QuizResult 
      score={score} 
      totalQuestions={quiz.questions.length} 
      totalPossibleScore={quiz.questions.reduce((sum, q) => sum + q.score, 0)}
      onRetry={() => router.reload()}
      onBack={() => router.push('/quiz')}
    />;
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const userAnswers = selectedAnswers[currentQuestion] || [];

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h2 className={styles.quizTitle}>{quiz.title}</h2>
        <div className={styles.timer}>
          Time Left: <span className={timeLeft < 60 ? styles.timerWarning : ''}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      <div className={styles.questionCounter}>
        Question {currentQuestion + 1} of {quiz.questions.length}
      </div>

      <div className={styles.questionCard}>
        <h3 className={styles.questionText}>{currentQuestionData.question}</h3>
        
        <div className={styles.choicesContainer}>
          {currentQuestionData.choices.map((choice, index) => (
            <div key={index} className={styles.choiceItem}>
              {currentQuestionData.type === 'MAQs' ? (
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`choice-${index}`}
                    checked={userAnswers.includes(choice)}
                    onChange={() => handleAnswerSelect(currentQuestion, choice)}
                  />
                  <label className="form-check-label" htmlFor={`choice-${index}`}>
                    {choice}
                  </label>
                </div>
              ) : (
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    id={`choice-${index}`}
                    name={`question-${currentQuestion}`}
                    checked={userAnswers.includes(choice)}
                    onChange={() => handleAnswerSelect(currentQuestion, choice)}
                  />
                  <label className="form-check-label" htmlFor={`choice-${index}`}>
                    {choice}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button 
          className="btn btn-secondary" 
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        {currentQuestion < quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNextQuestion}>
            Next
          </button>
        ) : (
          <button className="btn btn-success" onClick={calculateScore}>
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;