import React from 'react'
import { Toaster } from 'react-hot-toast'

const TosterProvider: React.FC = () => {
    return (
        <Toaster
            toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff'
                }
            }}
        />
    )
}

export default TosterProvider
