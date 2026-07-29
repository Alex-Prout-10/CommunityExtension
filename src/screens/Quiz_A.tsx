type QuizAProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    userAnswer: number;
    curr_question: {
        question: string;
        choices: string[][];
        answer: number;
    };
};

export default function QuizA({ retryQuiz, backToScan, userAnswer, curr_question }: QuizAProps) {
    
    let resultText = "Incorrect";
    if (userAnswer === curr_question.answer) {
        resultText = "Correct!!";
    }
    
    return (
        <div>
            <h1>{resultText}</h1>
            <h2>You submitted: {curr_question.choices[userAnswer][0]}</h2>
            <p>{curr_question.choices[userAnswer][1]}</p>

            <button onClick={retryQuiz}>
                Retry Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>

        </div>
    );
}