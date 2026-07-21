type ScanProps = {
    assessRisk: () => number;
};

export default function Scan({ assessRisk }: ScanProps) {
    const riskScore = assessRisk();
    
    return (
        <>
            <h3>Safe Scan</h3>
            <h4>Risk Score = {riskScore} / 100</h4>

            <p>Test Scan Page</p>
        </>
    );
}