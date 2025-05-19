// components/quiz/QuizTopicCard.js
import React from 'react';
import Link from 'next/link';
import styles from '@/styles/quiz.module.css';

const QuizTopicCard = ({ topic }) => {
  return (
    <div className={styles.topicCard}>
      <h3 className={styles.topicTitle}>{topic.title}</h3>
      <p className={styles.topicDescription}>{topic.description}</p>
      <div className={styles.topicDetails}>
        <span className="badge bg-primary">{topic.questionCount} Questions</span>
        <span className="badge bg-secondary">{topic.difficulty}</span>
      </div>
      <Link href={`/quiz/${topic.id}`}>
        <button className={`btn btn-primary ${styles.topicButton}`}>Start Quiz</button>
      </Link>
    </div>
  );
};

export default QuizTopicCard;