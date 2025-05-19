// data/quizzes/javascript.js
export const javascriptQuiz = {
    title: "JavaScript Quiz",
    description: "Test your knowledge of JavaScript fundamentals",
    timeLimit: 600, // in seconds (10 minutes)
    questions: [
      {
        question: 'Which of the following are JavaScript data types? (Select all that apply)',
        choices: ['String', 'Number', 'Function', 'Array'],
        type: 'MAQs', // Multiple Answer Questions
        correctAnswers: ['String', 'Number', 'Array'],
        score: 10,
      },
      {
        question: 'The "this" keyword in JavaScript refers to the current function.',
        choices: ['True', 'False'],
        type: 'boolean',
        correctAnswers: ['False'],
        score: 5,
      },
      {
        question: 'Which operator is used for strict equality comparison in JavaScript?',
        choices: ['==', '===', '=', '!='],
        type: 'MCQs', // Multiple Choice Questions
        correctAnswers: ['==='],
        score: 10,
      },
      // Add more questions...
    ]
  };
