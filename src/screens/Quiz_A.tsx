type QuizAProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    userAnswer: string[];
    actualAnswer: string[];
};

export default function QuizA({ retryQuiz, backToScan, userAnswer, actualAnswer }: QuizAProps) {
    
    let resultText = "Incorrect";
    if (userAnswer === actualAnswer) {
        resultText = "Correct!!";
    }
    
    return (
        <div>
            <h1>{resultText}</h1>
            <h2>You submitted: {userAnswer[0]}</h2>
            <p>{userAnswer[1]}</p>

            <button onClick={retryQuiz}>
                Retry Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>

        </div>
    );
}