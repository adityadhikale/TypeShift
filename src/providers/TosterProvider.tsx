import React from 'react'
import { Toaster } from 'react-hot-toast'

interface TosterProviderProps {
    mode: 'light' | 'dark';
}

const TosterProvider: React.FC<TosterProviderProps> = ({ mode }) => {
    return (
        <Toaster
            position="top-right"
            gutter={8}
            containerClassName={`${mode === 'dark' ? 'dark-mode-toaster' : 'light-mode-toaster'}`}
            toastOptions={{
                style: {
                    background: mode === 'dark' ? '#333' : '#fff',
                    color: mode === 'dark' ? '#fff' : '#333',
                    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: `0 3px 10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}`,
                    maxWidth: '350px',
                    textAlign: 'center',
                    margin: '0 auto',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    pointerEvents: 'auto',
                    animation: 'toast-enter 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)',
                },
                className: '',
                loading: {
                    iconTheme: {
                        primary: mode === 'dark' ? '#4dabf7' : '#1976d2',
                        secondary: mode === 'dark' ? '#fff' : '#fff',
                    },
                },
                success: {
                    iconTheme: {
                        primary: mode === 'dark' ? '#4caf50' : '#388e3c',
                        secondary: mode === 'dark' ? '#fff' : '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: mode === 'dark' ? '#f44336' : '#d32f2f',
                        secondary: mode === 'dark' ? '#fff' : '#fff',
                    },
                },
                duration: 3000,
            }}
        />
    )
}

export default TosterProvider
