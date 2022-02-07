import React from 'react';
import './App.css';
import Siriwave from './Siriwave';

function App() {
    const siriwaveConfig = {
        style: 'ios',
        width: 600,
        height: 100,
        speed: 0.015,
        amplitude: 0.5,
        frequency: 1.2,
        color: '#aa00ff',
        // cover: false,
        // autostart: false,
        pixelDepth: 0.05,
        // lerpSpeed: 0.01,
    }

    return (
        <div className="App">
            <Siriwave {...siriwaveConfig} />
        </div>
    );
}

export default App;
