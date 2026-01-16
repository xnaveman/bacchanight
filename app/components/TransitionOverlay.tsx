'use client';

import { useState, useEffect } from 'react';
import { useTransition } from './TransitionContext';
import styles from './TransitionOverlay.module.css';

export default function TransitionOverlay() {
    const { isTransitioning } = useTransition();
    const [phase, setPhase] = useState<'hidden' | 'covering' | 'revealing'>('revealing');

    // Animation initiale : révéler la page au chargement
    useEffect(() => {
        const timer = setTimeout(() => setPhase('hidden'), 800);
        return () => clearTimeout(timer);
    }, []);

    // Quand une transition commence
    useEffect(() => {
        if (isTransitioning) {
            setPhase('covering');
        }
    }, [isTransitioning]);

    // Quand la transition se termine (nouvelle page chargée)
    useEffect(() => {
        if (!isTransitioning && phase === 'covering') {
            setPhase('revealing');
            const timer = setTimeout(() => setPhase('hidden'), 800);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning, phase]);

    return (
        <div className={`${styles.overlay} ${styles[phase]}`}>
            <div className={styles.bar} style={{ animationDelay: '0ms' }} />
            <div className={styles.bar} style={{ animationDelay: '50ms' }} />
            <div className={styles.bar} style={{ animationDelay: '100ms' }} />
            <div className={styles.bar} style={{ animationDelay: '150ms' }} />
            <div className={styles.bar} style={{ animationDelay: '200ms' }} />
        </div>
    );
}
