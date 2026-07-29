type QuizAProps = {
    retryQuestion: () => void;
    next: () => void;
    userAnswer: number;
    curr_question: {
        question: string;
        choices: string[][];
        answer: number;
    };
    addToScore: () => void;
};

export default function QuizAScreen({ retryQuestion, next, userAnswer, curr_question, addToScore }: QuizAProps) {
    
    let resultText = "Incorrect";
    if (userAnswer === curr_question.answer) {
        resultText = "Correct!!";
    }
    
    return (
        <div>
            <h1>{resultText}</h1>
            <h2>You submitted: {curr_question.choices[userAnswer][0]}</h2>
            <p>{curr_question.choices[userAnswer][1]}</p>

            <button onClick={retryQuestion} disabled={userAnswer === curr_question.answer}>
                Retry Question
            </button>

            <button onClick={() => {
                    if (userAnswer === curr_question.answer) {
                        addToScore();
                    }
                    next();
                }
            }>
                Next
            </button>

        </div>
    );
}