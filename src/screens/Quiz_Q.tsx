type QuizQProps = {
    backToScan: () => void;
    submitAnswer: () => void;
    curr_question: {
        question: string;
        choices: string[][];
        answer: number;
    };
    userAnswer: number;
    setAnswer: React.Dispatch<React.SetStateAction<number>>;
};

export default function QuizQScreen({ backToScan, submitAnswer, curr_question, userAnswer, setAnswer }: QuizQProps) {
    return (
        <div>
            <h2>False Info Quiz</h2>

            <button onClick={backToScan}>
                Back to Scan
            </button>

            <p>{curr_question.question}</p>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[0]}
                checked={userAnswer === 0}
                onChange={() => setAnswer(0)}
                />
                {curr_question.choices[0][0]}
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[1]}
                checked={userAnswer === 1}
                onChange={() => setAnswer(1)}
                />
                {curr_question.choices[1][0]}
            </label>

            <label>
                <input 
                type="radio" 
                name="choice" 
                value={curr_question.choices[2]}
                checked={userAnswer === 2}
                onChange={() => setAnswer(2)}
                />
                {curr_question.choices[2][0]}
            </label>

            <button onClick={submitAnswer}>
                Submit
            </button>
        </div>
    );
}