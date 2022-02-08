import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SiriWave from 'siriwave';
// @ts-ignore
import SineWaves from 'sine-waves';

function App() {
    const sineRef: React.RefObject<HTMLDivElement> = useRef(null);
    const [sineWaves, setSiriWaves] = useState<any>(null);

    // useEffect(() => {
    //     // based on https://codepen.io/isuttell/pen/MYaoKX
    //     const sineWaves = new SineWaves({
    //         el: sineRef.current as HTMLElement, // fix me:  this.el.getContext is not a function
    //         speed: 5,
    //         ease: 'SineInOut',
    //         wavesWidth: '75%',
    //         rotate: 0,
    //         waves: [
    //             { timeModifier: 4, lineWidth: 1, amplitude: -25, wavelength: 25 },
    //             { timeModifier: 2, lineWidth: 1, amplitude: -10, wavelength: 30 },
    //             { timeModifier: 1, lineWidth: 1, amplitude: -30, wavelength: 30 },
    //             { timeModifier: 3, lineWidth: 1, amplitude: 40, wavelength: 40 },
    //             { timeModifier: 0.5, lineWidth: 1, amplitude: -60, wavelength: 60 },
    //             { timeModifier: 1.3, lineWidth: 1, amplitude: -40, wavelength: 40 }
    //         ],
    //     });
    //     setSiriWaves(sineWaves);
    // }, []);

    const siriRef: React.RefObject<HTMLDivElement> = useRef(null);
    const [siriWave, setSiriWave] = useState<any>(null);

    const defaultSpeed =  0.03
    const defaultAmplitude=  0.5

    useEffect(() => {
        const siriWave = new SiriWave({
            style: 'ios',
            // width: 900,
            height: 80,
            speed: defaultSpeed,
            amplitude: defaultAmplitude,
            frequency: 1.5,
            color: '#aa00ff',
            cover: false,
            autostart: false,
            pixelDepth: 0.05,
            // lerpSpeed: 0.01,
            container: siriRef.current as HTMLElement,
        });
        setSiriWave(siriWave);
        siriWave.start();
    }, []);

    const [started, setStarted] = useState(false);
    const [source, setSource] = useState<any>(null);
    const [processor, setProcessor] = useState<any>(null);

    const stopRecording = () => {
        source.disconnect();
        processor.disconnect();
        siriWave.setAmplitude(defaultAmplitude);
        siriWave.setSpeed(defaultSpeed);
        siriWave.stop();
        siriWave.start();
        setStarted(false);
    };

    // based on
    // https://siriwavejs.herokuapp.com/
    // https://siriwavejs.herokuapp.com/main.js
    const startRecording = (stream: MediaStream) => {
        //context depending on browser(Chrome/Firefox)
        const context =  new window.AudioContext();
        //create source for sound input.
        const source = context.createMediaStreamSource(stream);
        setSource(source);
        //create processor node.
        const processor = context.createScriptProcessor(1024, 1, 1);
        //create analyser node.
        const analyser = context.createAnalyser();
        //set fftSize to 4096
        analyser.fftSize = 4096;
        //array for frequency data.
        const myDataArray = new Float32Array(analyser.frequencyBinCount);

        //connect source->analyser->processor->destination.
        source.connect(analyser);
        analyser.connect(processor);
        processor.connect(context.destination);
        setProcessor(processor);

        //start siriwave
        // siriWave.start();
        setStarted(true);

        //event for change in audio data from source.
        processor.onaudioprocess = function(e) {
            let amplitude = 0;
            let frequency = 0;

            //copy frequency data to myDataArray from analyser.
            analyser.getFloatFrequencyData(myDataArray);

            //get max frequency which is greater than -100 dB.
            // @ts-ignore
            myDataArray.map((givenFrequencyDB, index) => {
                if(givenFrequencyDB > -100){
                    frequency = Math.max(index,frequency);
                }
            });

            //multipy frequency by resolution and divide it to scale for setting speed.
            frequency = ((1+frequency)*11.7185)/24000;
            //set the speed for siriwave
            siriWave.setSpeed(frequency);

            //find the max amplituded
            // @ts-ignore
            e.inputBuffer.getChannelData(0).map((item)=>{
                amplitude = Math.max(amplitude, Math.abs(item));
            });

            //output buffer data.
            // console.log(frequency, amplitude);

            //scale amplituded from [-1, 1] to [0, 10].
            amplitude = Math.abs(amplitude*5);

            //if amplitude is greater than 0 then set siriwave amplitude else set to 0.0.
            if(amplitude >= 0){
                siriWave.setAmplitude(amplitude);
            } else{
                siriWave.setAmplitude(0.0);
            }
        };
    };

    const toggleRecording = () => {
        if (!started) {
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: false })
                .then(startRecording)
        } else {
            stopRecording();
        }
    }

    return (
        <div className="App">
            <div ref={sineRef}></div>
            <div ref={siriRef}></div>

            <button onClick={() => toggleRecording()}>
                {started ? '■ Stop' : '▶ Start'}
            </button>
        </div>
    );
}

export default App;
