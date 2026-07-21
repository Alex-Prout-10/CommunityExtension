type QuizQProps = {
    backToScan: () => void;
    submitAnswer: () => void;
    answer: string;
    setAnswer: React.Dispatch<React.SetStateAction<string>>;
};

export default function QuizQ({ backToScan, submitAnswer, answer, setAnswer }: QuizQProps) {
    return (
        <div>
            <h2>False Info Quiz</h2>

            <button onClick={backToScan}>
                Back to Scan
            </button>

            <p>1. What to check to make sure info is true?</p>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value="Author Name"
                checked={answer === "Author Name"}
                onChange={(e) => setAnswer(e.target.value)}
                />
                Author Name
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value="Sources"
                checked={answer === "Sources"}
                onChange={(e) => setAnswer(e.target.value)}
                />
                Sources
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value="Today's Date"
                checked={answer === "Today's Date"}
                onChange={(e) => setAnswer(e.target.value)}
                />
                Today's Date
            </label>

            <button onClick={submitAnswer}>
                Submit
            </button>
        </div>
    );
}