  // data/quizzes/page.js
  import { javascriptQuiz } from './javascript';
  import { reactQuiz } from './react';
  import { nextjsQuiz } from './nextjs';
  
  export const quizTopics = [
    {
      id: 'javascript',
      title: javascriptQuiz.title,
      description: javascriptQuiz.description,
      questionCount: javascriptQuiz.questions.length,
      difficulty: 'Beginner to Intermediate',
    },
    {
      id: 'react',
      title: reactQuiz.title,
      description: reactQuiz.description,
      questionCount: reactQuiz.questions.length,
      difficulty: 'Intermediate',
    },
    {
      id: 'nextjs',
      title: nextjsQuiz.title,
      description: nextjsQuiz.description,
      questionCount: nextjsQuiz.questions.length,
      difficulty: 'Intermediate to Advanced',
    },
  ];
  
  export const getQuizByTopic = (topicId) => {
    switch (topicId) {
      case 'javascript':
        return javascriptQuiz;
      case 'react':
        return reactQuiz;
      case 'nextjs':
        return nextjsQuiz;
      default:
        return null;
    }
  };