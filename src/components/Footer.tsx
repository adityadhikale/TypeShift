import React from 'react';

interface FooterProps {
    mode: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ mode }) => {
    return (
        <>
            <footer
                className={`d-flex justify-content-center align-items-center ${mode === 'dark' ? 'bg-dark' : 'bg-light'}`}
                style={{
                    width: '100%',
                    height: '3rem',
                    color: mode === 'dark' ? '#ededed' : 'inherit'
                }}
            >
                Built with {mode === 'dark' ? '🤍' : '🖤'} by{' '}
                <span style={{ marginLeft: '0.5rem' }}>
                    <a
                        href="https://github.com/adityadhikale"
                        className="text-center py-4 text-decoration-none"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Aditya's GitHub Profile"
                        style={{ color: mode === 'dark' ? '#ededed' : 'inherit' }}
                    >
                        Aditya
                    </a>
                </span>
            </footer>

        </>
    );
};

export default Footer;
