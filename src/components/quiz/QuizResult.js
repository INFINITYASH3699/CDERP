// components/quiz/QuizResult.js
import React from 'react';
import styles from '@/styles/quiz.module.css';

const QuizResult = ({ score, totalQuestions, totalPossibleScore, onRetry, onBack }) => {
  const percentage = Math.round((score / totalPossibleScore) * 100);
  
  let resultMessage = '';
  let resultClass = '';
  
  if (percentage >= 80) {
    resultMessage = 'Excellent! You have a great understanding of the topic.';
    resultClass = styles.successScore;
  } else if (percentage >= 60) {
    resultMessage = 'Good job! You have a solid understanding, but there\'s room for improvement.';
    resultClass = styles.primaryScore;
  } else if (percentage >= 40) {
    resultMessage = 'Not bad, but you might want to study more on this topic.';
    resultClass = styles.warningScore;
  } else {
    resultMessage = 'You need to improve your knowledge on this topic.';
    resultClass = styles.dangerScore;
  }

  return (
    <div className={styles.resultContainer}>
      <h2>Quiz Result</h2>
      
      <div className={`${styles.resultScore} ${resultClass}`}>
        <h3>Your Score: {score} / {totalPossibleScore}</h3>
        <div className={styles.percentage}>{percentage}%</div>
      </div>
      
      <p className={styles.resultMessage}>{resultMessage}</p>
      
      <div className={styles.resultDetails}>
        <p>Questions Answered: {totalQuestions}</p>
      </div>
      
      <div className={styles.resultButtons}>
        <button className="btn btn-primary" onClick={onRetry}>
          Retry Quiz
        </button>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Topics
        </button>
      </div>
    </div>
  );
};

export default QuizResult;