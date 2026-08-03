type HomeProps = {
    initScan: () => void;
};

export default function HomeScreen({ initScan }: HomeProps) {
    return (
        <div className="home-screen">
            <h2>Safe Scan</h2>

            <button onClick={initScan}>
                Scan Website
            </button>
        </div>
    );
}