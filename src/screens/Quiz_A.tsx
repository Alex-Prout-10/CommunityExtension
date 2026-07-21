type QuizAProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    answer: string;
};

export default function QuizA({ retryQuiz, backToScan, answer }: QuizAProps) {
    return (
        <div>
            <h2>You submitted: {answer}</h2>

            <button onClick={retryQuiz}>
                Retry Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>

        </div>
    );
}