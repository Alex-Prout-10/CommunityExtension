type HomeProps = {
    initScan: () => void;
};

export default function HomeScreen({ initScan }: HomeProps) {
    return (
        <div className="home-screen">
            <h2>MILE-oh</h2>
            <p>Media Information and Literacy Extension</p>

            <button onClick={initScan}>
                Scan Website
            </button>
        </div>
    );
}
