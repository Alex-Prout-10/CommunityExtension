type ScanProps = {
    assessRisk: () => number;
    takeQuiz: () => void;
};

export default function Scan({ assessRisk, takeQuiz }: ScanProps) {
    const riskScore = assessRisk();
    
    return (
        <>
            <h3>Safe Scan</h3>
            <h4>Risk Score = {riskScore} / 100</h4>

            <p>Test Scan Page</p>

            <button onClick={takeQuiz} >
                Take Quiz
            </button>
        </>
    );
}