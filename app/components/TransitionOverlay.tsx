'use client';

import { useState, useEffect } from 'react';
import { useTransition } from './TransitionContext';
import styles from './TransitionOverlay.module.css';

export default function TransitionOverlay() {
    const { isTransitioning } = useTransition();
    const [stage, setStage] = useState<'idle' | 'enter' | 'exit'>('enter');

    // Animation initiale au chargement
    useEffect(() => {
        setStage('enter');
        const timer = setTimeout(() => {
            setStage('idle');
        }, 900);
        return () => clearTimeout(timer);
    }, []);

    // Animation lors des transitions
    useEffect(() => {
        if (isTransitioning) {
            setStage('exit');
            
            const timer = setTimeout(() => {
                setStage('enter');
            }, 800);
            
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    return (
        <div className={`${styles.overlay} ${stage === 'exit' ? styles.exit : ''} ${stage === 'enter' ? styles.enter : ''}`}>
            <div className={`${styles.band} ${styles.band1}`}></div>
            <div className={`${styles.band} ${styles.band2}`}></div>
            <div className={`${styles.band} ${styles.band3}`}></div>
            <div className={`${styles.band} ${styles.band4}`}></div>
            <div className={`${styles.band} ${styles.band5}`}></div>
        </div>
    );
}
