"use client";

import { useState, useEffect } from 'react';
import TransitionLink from './components/TransitionLink';
import styles from './page.module.css';

export default function Home() {
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile) {
        return (
            <div className={styles.desktopWarning}>
                <h1>Accès Mobile Uniquement</h1>
                <p>Ce jeu est conçu pour être joué sur smartphone.</p>
                <p>Scannez le QR code ou ouvrez cette page sur votre téléphone.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <span className={styles.titleSmall}>THE</span>
                <h1 className={styles.title}>ART</h1>
                <h1 className={styles.titleOutline}>HEIST</h1>
            </div>
            
            <p className={styles.subtitle}>
                Infiltrez le musée. Volez les œuvres. Échappez-vous.
            </p>
            
            <div className={styles.instructions}>
                <div className={styles.instructionItem}>
                    <span className={styles.instructionNumber}>1</span>
                    <span>Trouvez les codes des tableaux</span>
                </div>
                <div className={styles.instructionItem}>
                    <span className={styles.instructionNumber}>2</span>
                    <span>Crochetez les cadenas</span>
                </div>
                <div className={styles.instructionItem}>
                    <span className={styles.instructionNumber}>3</span>
                    <span>Évitez l&apos;alarme</span>
                </div>
            </div>

            <TransitionLink href="/game" className={styles.startButton}>
                INFILTRER LE MUSÉE
            </TransitionLink>
            
            {/*<p className={styles.footer}>Bacchanight 2026</p>*/}
        </div>
    );
}
