// src/app/(routes)/quiz/[topic]/page.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getQuizByTopic } from '@/data/quizzes/page';
import QuizComponent from '@/components/quiz/QuizComponent';
import styles from '@/styles/quiz.module.css';

export default function QuizPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params); // Unwrap params using React.use()
  const { topic } = unwrappedParams; // Access topic from unwrapped params
  const quiz = topic ? getQuizByTopic(topic) : null;

  if (!quiz) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          {topic ? 'Quiz not found' : 'Loading...'}
        </div>
        <button 
          className={`btn btn-primary ${styles.backButton}`} 
          onClick={() => router.push('/quiz')}
        >
          Back to Topics
        </button>
      </div>
    );
  }

  return (
    <div className={styles.quizPageContainer}>
      <div className={styles.backLink}>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => router.push('/quiz')}
        >
          ← Back to Topics
        </button>
      </div>
      <QuizComponent quiz={quiz} />
    </div>
  );
}