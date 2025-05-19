// src/app/(routes)/quiz/page.js
import React from 'react';
import { quizTopics } from '@/data/quizzes/page';
import QuizTopicCard from '@/components/quiz/QuizTopicCard';
import styles from '@/styles/quiz.module.css';

export default function QuizTopicsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.topicsContainer}>
        <h1 className={styles.topicsHeader}>Select a Quiz Topic</h1>
        <div className={styles.topicsGrid}>
          {quizTopics.map((topic) => (
            <QuizTopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </div>
  );
}