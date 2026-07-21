type QuizAProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    userAnswer: string;
    actualAnswer: string;
};

export default function QuizA({ retryQuiz, backToScan, userAnswer, actualAnswer }: QuizAProps) {
    
    let resultText = "Incorrect";
    if (userAnswer === actualAnswer) {
        resultText = "Correct!!";
    }
    
    return (
        <div>
            <h1>{resultText}</h1>
            <h2>You submitted: {userAnswer}</h2>

            <button onClick={retryQuiz}>
                Retry Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>

        </div>
    );
}