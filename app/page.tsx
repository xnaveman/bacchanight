"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import TransitionLink from './components/TransitionLink';
import styles from './page.module.css';

const chatMessages = [
    { type: 'user', text: "Tu penses que ça ira ?" },
    { type: 'complice', text: "Mais oui ça va être simple tu verras ! 👌" },
    { type: 'complice', text: "Juste trouves le code des tableaux, c'est sous le format XXXX, j'ai fait du repérage dans le musée, 4 chiffres seront affichés a côté de chaque tableau, et j'ai noté aussi ceux qui valent le plus cher 💸" },
    { type: 'complice', text: "Ensuite tu crochètes les cadenas 🔓" },
    { type: 'complice', text: "Et tu te barres avant la fin de l'alarme. Simple non ? 🤫" },
];

export default function Home() {
    const [isMobile, setIsMobile] = useState(true);
    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        chatMessages.forEach((_, index) => {
            setTimeout(() => {
                setVisibleMessages(prev => [...prev, index]);
            }, index * 400 + 300);
        });
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
            <Image src="/title.svg" alt="The Art'Heist" width={280} height={80} className={styles.titleImage} priority />
            <div className={styles.chatContainer}>
                {chatMessages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`${styles.chatBubble} ${msg.type === 'user' ? styles.userBubble : styles.compliceBubble} ${visibleMessages.includes(index) ? styles.visible : ''}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <TransitionLink href="/game" className={styles.startButton}>
                INFILTRER LE MUSÉE
            </TransitionLink>
            
            <TransitionLink href="/leaderboard" className={styles.leaderboardButton}>
                VOIR LE CLASSEMENT
            </TransitionLink>

        </div>
    );
}
