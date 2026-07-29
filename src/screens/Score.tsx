type ScoreProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    totalCorrect: number;
};

export default function ScoreScreen({ retryQuiz, backToScan, totalCorrect }: ScoreProps) {
    
    // TODO -> FIX RETRY QUIZ BUTTON (goes back to prev question currently)
    return (
        <div>
            <h1>Score for False Info Quiz:</h1>
            <h2>{totalCorrect} / 3</h2>
            <p>Good Job!!</p>

            <button onClick={retryQuiz}>
                Retry Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>

        </div>
    );
}