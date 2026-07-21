
type HomeProps = {
    scanWeb: () => void;
};

export default function Home({ scanWeb }: HomeProps) {
    return (
        <div className="home-screen">
            <h2>Safe Scan</h2>

            <button onClick={scanWeb}>
                Scan Website
            </button>
        </div>
    );
}