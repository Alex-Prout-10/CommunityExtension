type QuizQProps = {
    backToScan: () => void;
    submitAnswer: () => void;
    curr_question: {
        question: string;
        choices: string[][];
        answer: string[];
    };
    userAnswer: string[];
    setAnswer: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function QuizQ({ backToScan, submitAnswer, curr_question, userAnswer, setAnswer }: QuizQProps) {
    return (
        <div>
            <h2>False Info Quiz</h2>

            <button onClick={backToScan}>
                Back to Scan
            </button>

            <p>1. {curr_question.question}</p>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[0]}
                checked={userAnswer === curr_question.choices[0]}
                onChange={() => setAnswer(curr_question.choices[0])}
                />
                {curr_question.choices[0][0]}
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[1]}
                checked={userAnswer === curr_question.choices[1]}
                onChange={() => setAnswer(curr_question.choices[1])}
                />
                {curr_question.choices[1][0]}
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[2]}
                checked={userAnswer === curr_question.choices[2]}
                onChange={() => setAnswer(curr_question.choices[2])}
                />
                {curr_question.choices[2][0]}
            </label>

            <button onClick={submitAnswer}>
                Submit
            </button>
        </div>
    );
}