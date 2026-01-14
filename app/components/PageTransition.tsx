'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageTransition.module.css';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState<'idle' | 'enter' | 'exit'>('idle');

    useEffect(() => {
        // Quand le pathname change, on déclenche l'animation de sortie
        if (children !== displayChildren) {
            setTransitionStage('exit');
            setIsTransitioning(true);
            
            // Après l'animation de sortie, on change le contenu
            const exitTimer = setTimeout(() => {
                setDisplayChildren(children);
                setTransitionStage('enter');
                
                // Après l'animation d'entrée, on revient à idle
                const enterTimer = setTimeout(() => {
                    setTransitionStage('idle');
                    setIsTransitioning(false);
                }, 800);
                
                return () => clearTimeout(enterTimer);
            }, 800);
            
            return () => clearTimeout(exitTimer);
        }
    }, [children, displayChildren]);

    // Animation initiale au chargement de la page
    useEffect(() => {
        setTransitionStage('enter');
        const timer = setTimeout(() => {
            setTransitionStage('idle');
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.transitionWrapper}>
            {/* Les bandes de transition */}
            <div className={`${styles.transitionOverlay} ${transitionStage === 'exit' ? styles.exit : ''} ${transitionStage === 'enter' ? styles.enter : ''}`}>
                <div className={`${styles.band} ${styles.band1}`}></div>
                <div className={`${styles.band} ${styles.band2}`}></div>
                <div className={`${styles.band} ${styles.band3}`}></div>
                <div className={`${styles.band} ${styles.band4}`}></div>
                <div className={`${styles.band} ${styles.band5}`}></div>
            </div>
            
            {/* Le contenu de la page */}
            <div className={styles.pageContent}>
                {displayChildren}
            </div>
        </div>
    );
}
