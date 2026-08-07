type HomeProps = {
    initScan: () => void;
};

export default function HomeScreen({ initScan }: HomeProps) {
    return (
        <div className="screen home-screen">
            <header className="brand-header">
                <div>
                    <p className="eyebrow">MEDIA LITERACY COMPANION</p>
                    <h1>MILE-oh</h1>
                    <p className="brand-subtitle">Think critically. Click wisely.</p>
                </div>
                <img className="mascot" src="/MILE-oh_lightmode.jpg" alt="MILE-oh flamingo mascot" />
            </header>
            <section className="hero-card">
                <span className="hero-icon">◈</span>
                <h2>Check the page you’re on</h2>
                <p>Get practical signals for links, media, and claims—then decide what to verify.</p>
                <button className="primary-button" onClick={initScan}>Scan this page <span aria-hidden="true">→</span></button>
            </section>
            <p className="privacy-note">MILE-oh stores scan signals, not the page’s full URL or contents.</p>
        </div>
    );
}
