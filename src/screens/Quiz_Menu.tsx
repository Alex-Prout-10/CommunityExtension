type QuizMenuProps = {
    backToScan: () => void;
    quiz0: () => void;
    quiz1: () => void;
};

export default function QuizMenuScreen({backToScan, quiz0, quiz1}: QuizMenuProps) {

    return(
        <div>
            <h3>Quiz Menu</h3>

            <button onClick={quiz0}>
                False Info Quiz
            </button>

            <button onClick={quiz1}>
                AI Images Quiz
            </button>

            <button onClick={backToScan}>
                Back to Scan
            </button>
        </div>
    );
}