type ScanProps = {
    assessRisk: () => number;
    takeQuiz: () => void;
    quizMenu: () => void;
};

export default function ScanScreen({ assessRisk, takeQuiz, quizMenu }: ScanProps) {
    const riskScore = assessRisk();
    
    return (
        <>
            <h3>MILE-oh Scan</h3>
            <h4>Risk Score = {riskScore} / 100</h4>

            <p>Test Scan Page</p>

            <button onClick={takeQuiz} >
                Take Quiz
            </button>

            <button onClick={quizMenu} >
                All Quizzes
            </button>
        </>
    );
}
