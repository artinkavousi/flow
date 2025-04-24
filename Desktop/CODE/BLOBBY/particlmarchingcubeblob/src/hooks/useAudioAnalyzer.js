import { useEffect, useRef, useState } from 'react';

export default function useAudioAnalyzer(fftSize = 2048, smoothing = 0.8) {
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [audioData, setAudioData] = useState({
    timeDomainData: [],
    frequencyData: [],
    low: 0,
    mid: 0,
    high: 0
  });

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothing;
    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);

    // grab microphone stream
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        update();
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err);
      });

    let rafId;
    function update() {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const freqData = dataArrayRef.current;
      // split into low, mid, high bands
      const lowSlice = freqData.slice(0, bufferLength / 3);
      const midSlice = freqData.slice(bufferLength / 3, (2 * bufferLength) / 3);
      const highSlice = freqData.slice((2 * bufferLength) / 3, bufferLength);
      const avg = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length / 255;
      const low = avg(lowSlice);
      const mid = avg(midSlice);
      const high = avg(highSlice);

      setAudioData({
        timeDomainData: Array.from(dataArrayRef.current),
        frequencyData: Array.from(freqData),
        low,
        mid,
        high
      });

      rafId = requestAnimationFrame(update);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [fftSize]);

  // Update smoothing dynamically without recreating context
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothing;
    }
  }, [smoothing]);

  return audioData;
} 