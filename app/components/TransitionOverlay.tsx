'use client';

import { useState, useEffect } from 'react';
import { useTransition } from './TransitionContext';
import styles from './TransitionOverlay.module.css';

export default function TransitionOverlay() {
    const { isTransitioning, isNavigating } = useTransition();
    const [stage, setStage] = useState<'idle' | 'enter' | 'exit' | 'cover'>('enter');
    const [mounted, setMounted] = useState(false);

    // Animation initiale au chargement
    useEffect(() => {
        setMounted(true);
        setStage('enter');
        const timer = setTimeout(() => {
            setStage('idle');
        }, 900);
        return () => clearTimeout(timer);
    }, []);

    // Animation lors des transitions
    useEffect(() => {
        if (isTransitioning && mounted) {
            setStage('exit');
            
            const timer = setTimeout(() => {
                setStage('cover'); // Garder couvert pendant la navigation
            }, 700);
            
            return () => clearTimeout(timer);
        } else if (!isTransitioning && !isNavigating && stage === 'cover') {
            // Lancer l'animation d'entrée après le chargement
            setStage('enter');
            const timer = setTimeout(() => {
                setStage('idle');
            }, 900);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning, isNavigating, mounted, stage]);

    return (
        <div className={`${styles.overlay} ${stage === 'exit' ? styles.exit : ''} ${stage === 'enter' ? styles.enter : ''} ${stage === 'idle' ? styles.idle : ''} ${stage === 'cover' ? styles.cover : ''}`}>
            <div className={`${styles.band} ${styles.band1}`}></div>
            <div className={`${styles.band} ${styles.band2}`}></div>
            <div className={`${styles.band} ${styles.band3}`}></div>
            <div className={`${styles.band} ${styles.band4}`}></div>
            <div className={`${styles.band} ${styles.band5}`}></div>
        </div>
    );
}
