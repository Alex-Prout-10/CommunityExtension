import { useState } from 'react'
import './App.css'
import HomeScreen from './screens/Home'
import ScanScreen from './screens/Scan'
import QuizQScreen from './screens/Quiz_Q'
import QuizAScreen from './screens/Quiz_A'
import ScoreScreen from './screens/Score'
import { listOfQuestions } from './components/quiz_q_placeholder'

// interface ScanButtonProps {
//   title: string;
//   disabled: boolean;
//   scan: () => void;
// }

// interface WebsiteProps {
//   title: string;
//   url: string;
//   links: number;
//   images: number;
// }

// interface MascotProps {
//   danger: boolean;
// }

// function Mascot({ danger }: MascotProps) {

//   let dangerMessage = "Website looks all good :)";
//   if(danger) {
//     dangerMessage = "WARNING dangerous website!!";
//   }

//   return ( <div>
//     <p>MIL Helper:</p>
//     <p>{dangerMessage}</p>
//   </div>);
// }

// function ScanButton({ title, disabled, scan }: ScanButtonProps) {
//   return (
//     <button disabled={disabled} onClick={scan}>
//       {title}
//     </button>
//   );
// }

// function CurrWebsite({ title, url, links, images }: WebsiteProps) {
//   return (
//     <div>
//       <p>Website: {title}</p>
//       <p>URL: {url}</p>
//       <p>{links} links and {images} images</p>
//     </div>);
// }

// // Clicking the scan website button and asking the content.ts for the website info
// const handleClick = (): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query(
//       { active: true, currentWindow: true },
//       ([tab]) => {
//         if (!tab.id) {
//           reject("No tab found");
//           return;
//         }

//         chrome.tabs.sendMessage(
//           tab.id,
//           { type: "SCRAPE_SITE" },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               reject(chrome.runtime.lastError.message);
//               return;
//             }

//             resolve(response);
//           }
//         );
//       }
//     );
//   });
// };

type Question = {
  question: string;
  choices: string[][];
  answer: number;
};

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

function checkDanger() {
  return 10;
}

function App() {
  const [screen, setScreen] = useState<"home" | "scan" | "quiz_q" | "quiz_a" | "score">("home");
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

  // init the vars for the curr question and clear the prev answer
  function initQuestion(question: Question) {
    setQuestion(question);
    setAnswer(-1);
    setNextIndex(prev => prev + 1);
    setScreen("quiz_q");
  }

  // creates a new quiz with 3 random questions chosen from the category given
  function startQuiz() {
    setScore(0);
    const quiz = generateRandQuestions(listOfQuestions);
    setQuizQuestions(quiz); 
    setNextIndex(0);
    initQuestion(quiz[0]);
  }

  if (screen === "home") {
    return <HomeScreen scanWeb={() => setScreen("scan")} />;
  }

  if (screen === "scan") {
    return (
      <ScanScreen 
        assessRisk={() => checkDanger()} 
        takeQuiz={() => startQuiz()} 
      />
    );
  }

  if (screen === "quiz_q") {
    return (
      <QuizQScreen 
        backToScan={() => setScreen("scan")} 
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
        retryQuiz={() => startQuiz()}
        backToScan={() => setScreen("scan")} 
        totalCorrect={totalScore}
      />
    );
  }

  // const [dangerLevel, setDangerLevel] = useState(false);
  // const [basicInfo, setWebInfo] = useState({
  //   title: "Unknown",
  //   url: "N/A",
  //   links: 0,
  //   images: 0
  // });

  // const scanSite = async () => { 
  //   setDangerLevel(prev => !prev);

  //   const info = await handleClick();
  //   setWebInfo(info);
  // };

  // return (
  //   <div className="pop-up">
  //     <h4>Safe Scan</h4>
  //     <CurrWebsite 
  //     title={basicInfo.title} 
  //     url={basicInfo.url}
  //     links={basicInfo.links}
  //     images={basicInfo.images}/>
  //     <ScanButton 
  //     title="Scan Page" 
  //     disabled={false} 
  //     scan={scanSite}
  //     />
  //     <Mascot danger={dangerLevel}/>
  //   </div>
  // )

  return <div>Unknown screen</div>;
}


export default App
