import React from 'react';
import { FiHeart } from 'react-icons/fi';

interface FooterProps {
    mode: 'light' | 'dark';
}

const Footer: React.FC<FooterProps> = ({ mode }) => {
    return (
        <>
            <footer
                className={`d-flex justify-content-center align-items-center py-3 ${mode === 'dark' ? 'bg-dark' : 'bg-light'}`}
                style={{
                    width: '100%',
                    color: mode === 'dark' ? '#ededed' : 'inherit',
                    borderTop: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    marginTop: 'auto'
                }}
                aria-label="Footer"
            >
                <div className="d-flex align-items-center justify-content-center">
                    Built with <FiHeart 
                        className="mx-1" 
                        style={{ 
                            color: mode === 'dark' ? '#e25555' : '#d6336c',
                            fill: mode === 'dark' ? '#e25555' : '#d6336c',
                            verticalAlign: 'middle',
                            animation: 'heartbeat 1.5s ease-in-out infinite'
                        }}
                        aria-label="heart" 
                    /> by{' '}
                    <span style={{ marginLeft: '0.5rem' }}>
                        <a
                            href="https://github.com/adityadhikale"
                            className="text-decoration-none fw-bold"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Aditya's GitHub Profile"
                            style={{ 
                                color: mode === 'dark' ? '#ededed' : 'inherit',
                                transition: 'color 0.3s ease'
                            }}
                        >
                            Aditya
                        </a>
                    </span>
                </div>
            </footer>

        </>
    );
};

export default Footer;
