'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Les tableaux avec leurs infos - à synchroniser avec game/page.tsx
const tableauxData: Record<string, { nom: string; artiste: string; date: string; valeur: number; image: string }> = {
    "1234": { nom: "Jeanne Shnegg cousant", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 5000, image: "/tableaux/tableau1.jpg" },
    "5678": { nom: "Vue du port", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 8000, image: "/tableaux/tableau2.jpg" },
    "9012": { nom: "Paysage maritime", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 12000, image: "/tableaux/tableau3.jpg" },
    "3456": { nom: "Portrait de femme", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 10000, image: "/tableaux/tableau4.jpg" },
    "7890": { nom: "Nature morte", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 7000, image: "/tableaux/tableau5.jpg" },
};

interface GameResults {
    money: number;
    stolenTableaux: string[];
    tableauxCount: number;
}

const endMessages = [
    { type: 'complice', text: "Et tu te barres avant la fin de l'alarme." },
    { type: 'user', text: "Ok je viens de finir" },
    { type: 'complice', text: "On a réussi ! On va être riche !" },
    { type: 'complice', text: "Nan plus sérieusement merci de m'avoir aidé dans ce faux cambriolage, la sécurité du musée est à revoir mais on sait quelles sont les pistes d'améliorations 👍" },
];

export default function GameOver() {
    const [results, setResults] = useState<GameResults | null>(null);
    const [currentPage, setCurrentPage] = useState<'recap' | 'end'>('recap');
    const [visible, setVisible] = useState(false);
    const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('gameResults');
        if (stored) {
            setResults(JSON.parse(stored));
        }
        setTimeout(() => setVisible(true), 100);
    }, []);

    useEffect(() => {
        if (currentPage === 'end') {
            setVisibleMessages([]);
            endMessages.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleMessages(prev => [...prev, index]);
                }, index * 500 + 300);
            });
        }
    }, [currentPage]);

    const handleContinue = () => {
        setVisible(false);
        setTimeout(() => {
            setCurrentPage('end');
            setVisible(true);
        }, 300);
    };

    const totalMoney = results?.stolenTableaux.reduce((sum, code) => {
        return sum + (tableauxData[code]?.valeur || 0);
    }, 0) || 0;

    if (currentPage === 'recap') {
        return (
            <div className={styles.container}>
                <div className={`${styles.content} ${visible ? styles.visible : ''}`}>
                    <h1 className={styles.title}>Braquage Accompli</h1>
                    
                    <div className={styles.tableauxSection}>
                        <h2 className={styles.sectionTitle}>Oeuvres volées :</h2>
                        
                        <div className={styles.tableauxList}>
                            {results?.stolenTableaux.map((code, i) => {
                                const tableau = tableauxData[code];
                                if (!tableau) return null;
                                return (
                                    <div key={i} className={styles.tableauCard}>
                                        <div className={styles.tableauImage}>
                                            <Image 
                                                src={tableau.image} 
                                                alt={tableau.nom}
                                                width={100}
                                                height={80}
                                                className={styles.tableauImg}
                                            />
                                        </div>
                                        <div className={styles.tableauInfo}>
                                            <p className={styles.tableauArtiste}>{tableau.artiste} : {tableau.nom}</p>
                                            <p className={styles.tableauDate}>• {tableau.date}</p>
                                            <p className={styles.tableauPrix}>Prix : {tableau.valeur.toLocaleString()} €</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <p className={styles.total}>Total : {totalMoney.toLocaleString()}€</p>

                    <button className={styles.continueButton} onClick={handleContinue}>
                        Continuer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.content} ${visible ? styles.visible : ''}`}>
                <div className={styles.chatContainer}>
                    {endMessages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`${styles.chatBubble} ${msg.type === 'user' ? styles.userBubble : styles.compliceBubble} ${visibleMessages.includes(index) ? styles.bubbleVisible : ''}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                <h1 className={styles.endTitle}>THE ART&apos;HEIST</h1>

                <button className={styles.endButton} onClick={() => window.location.href = '/'}>
                    Merci d&apos;avoir jouer
                </button>
            </div>
        </div>
    );
}
