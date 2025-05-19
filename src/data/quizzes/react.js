  
  // data/quizzes/react.js
  export const reactQuiz = {
    title: "React Quiz",
    description: "Test your knowledge of React",
    timeLimit: 600,
    questions: [
      {
        question: 'What is the correct way to create a React component?',
        choices: [
          'class MyComponent extends React.Component',
          'function MyComponent() {}',
          'const MyComponent = () => {}',
          'All of the above'
        ],
        type: 'MCQs',
        correctAnswers: ['All of the above'],
        score: 10,
      },
      // Add more questions...
    ]
  };
  
