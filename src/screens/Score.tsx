type ScoreProps = {
    retryQuiz: () => void;
    backToScan: () => void;
    totalCorrect: number;
    category: string;
};

export default function ScoreScreen({ retryQuiz, backToScan, totalCorrect, category }: ScoreProps) {
    
    // TODO -> FIX RETRY QUIZ BUTTON (goes back to prev question currently)
    return (
        <div>
            <h2>Score for {category} Quiz:</h2>
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