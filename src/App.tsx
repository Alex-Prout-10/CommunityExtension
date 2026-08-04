import { useState } from 'react'
import './App.css'
import HomeScreen from './screens/Home'
import ScanScreen from './screens/Scan'
import QuizQScreen from './screens/Quiz_Q'
import QuizAScreen from './screens/Quiz_A'
import ScoreScreen from './screens/Score'
import QuizMenuScreen from './screens/Quiz_Menu'
import { listOfCats } from './components/quiz_q_placeholder'

/**
 * Defines a Question type
 * question - the curr question being asked
 * choices - a list of tuples with the [answer option, an explination why it's correct or not]
 * answer - the index of the correct option in choices
 */
type Question = {
  question: string;
  choices: string[][];
  answer: number;
};

/**
 * A method to generate a quiz of 3 random Questions from a list of Questions
 * @param questions - a list of Questions to sample from
 * @returns a list of 3 random Questions selected from the inputted list
 */
function generateRandQuestions(questions: Question[]) {
  const quiz = [];
  const indicies: number[] = [];
  while(quiz.length != 3) {
    const questionIndex = Math.floor(Math.random() * questions.length);
    if (!indicies.includes(questionIndex)) {
      indicies.push(questionIndex);
      quiz.push(questions[questionIndex]);
    }
  }

  return quiz;
}

// TODO
function checkDanger() {
  return 10;
}

// TODO -> listOfCategories: Category[]
function highestRiskCat() {
  return 0;
}

function App() {
  const [screen, setScreen] = useState<"home" | "scan" | "quiz_q" | "quiz_a" | "score" | "quiz_menu">("home");
  const [currQuestion, setQuestion] = useState<Question>(
    {
    question: "PLACEHOLDER",
    choices: [ ["a1", "empty desc"], ["a2", "empty desc"], ["a3", "empty desc"] ],
    answer: 2
    }
  )
  const [userAnswer, setAnswer] = useState(-1);
  const [totalScore, setScore] = useState(0);
  const [currQuiz, setQuizQuestions] = useState<Question[]>([]);
  const [nextQuestionIndex, setNextIndex] = useState(0);
  const [currCatIndex, setCatIndex] = useState(-1);

  // init the vars for the curr question and clear the prev answer
  function initQuestion(question: Question) {
    setQuestion(question);
    setAnswer(-1);
    setNextIndex(prev => prev + 1);
    setScreen("quiz_q");
  }

  // creates a new quiz with 3 random questions chosen from the category given
  function startQuiz(category: number) {
    setScore(0);
    setCatIndex(category);
    const quiz = generateRandQuestions(listOfCats[category].questions); 
    setQuizQuestions(quiz); 
    setNextIndex(0);
    initQuestion(quiz[0]);
  }

  function initScanScreen() {
    const highest = highestRiskCat();
    setCatIndex(highest);
    setScreen("scan");
  }

  if (screen === "home") {
    return <HomeScreen initScan={initScanScreen}/>;
  }

  if (screen === "scan") {
    return (
      <ScanScreen 
        assessRisk={() => checkDanger()} 
        takeQuiz={() => startQuiz(currCatIndex)} 
        quizMenu={() => setScreen("quiz_menu")}
      />
    );
  }

  if (screen === "quiz_q") {
    return (
      <QuizQScreen 
        backToScan={() => initScanScreen()} 
        submitAnswer={() => {
            if (userAnswer != -1) {
              setScreen("quiz_a")
            }
          }
        }
        curr_question={currQuestion}
        userAnswer={userAnswer}
        setAnswer={setAnswer}
        questionIndex={nextQuestionIndex}
        category={listOfCats[currCatIndex].name}
      />
    );
  }

  if (screen === "quiz_a") {
    return (
      <QuizAScreen
        retryQuestion={() => setScreen("quiz_q")}
        next={() => {
          if (nextQuestionIndex >= currQuiz.length) {
            setScreen("score");
          } else {
            initQuestion(currQuiz[nextQuestionIndex]);
          }
        }}
        userAnswer={userAnswer}
        curr_question={currQuestion}
        addToScore={() => setScore(prev => prev + 1)}
      />
    );
  }

  if (screen === "score") {
    return (
      <ScoreScreen 
        retryQuiz={() => startQuiz(currCatIndex)}
        backToScan={() => initScanScreen()} 
        totalCorrect={totalScore}
        category={listOfCats[currCatIndex].name}
      />
    );
  }

  if (screen === "quiz_menu") {
    return (
      <QuizMenuScreen 
        backToScan={() => initScanScreen()}
        quiz0={() => startQuiz(0)}
        quiz1={() => startQuiz(1)}
      />
    )
  }

  // if something doesn't load correctly
  return <div>Unknown screen</div>;
}

export default App