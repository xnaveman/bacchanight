'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Les tableaux avec leurs infos - à synchroniser avec game/page.tsx
const tableauxData: Record<string, { nom: string; artiste: string; date: string; valeur: number; image: string }> = {
    "0384": { nom: "Tableau 1", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "7291": { nom: "Tableau 2", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "4607": { nom: "Tableau 3", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "9152": { nom: "Tableau 4", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "2846": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 3500, image: "placeholder.webp" },
    "6703": { nom: "Tableau reconnu", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "1498": { nom: "Tableau cher", artiste: "Artiste X", date: "vers 1900", valeur: 10000, image: "placeholder.webp" },
    "5029": { nom: "Tableau reconnu", artiste: "Artiste X", date: "vers 1900", valeur: 8000, image: "placeholder.webp" },
    "8361": { nom: "Tableau reconnu", artiste: "Artiste X", date: "vers 1900", valeur: 4000, image: "placeholder.webp" },
    "7740": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 3500, image: "placeholder.webp" },
    "0916": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 3500, image: "placeholder.webp" },
    "3582": { nom: "Tableau ", artiste: "Artiste X", date: "vers 1900", valeur: 6000, image: "placeholder.webp" },
    "6409": { nom: "Tableau", artiste: "Artiste X", date: "vers 1900", valeur: 2500, image: "placeholder.webp" },
    "2175": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "9843": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "4031": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "5687": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "7924": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "1250": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "6819": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "9476": { nom: "Tableau 5", artiste: "Artiste X", date: "vers 1900", valeur: 5000, image: "placeholder.webp" },
    "3068": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 1000, image: "placeholder.webp" },
    "8542": { nom: "Tableau", artiste: "Artiste X", date: "vers 1900", valeur: 4000, image: "placeholder.webp" },
    "2397": { nom: "Tableau", artiste: "Artiste X", date: "vers 1900", valeur: 2500, image: "placeholder.webp" },
    "7104": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 3000, image: "placeholder.webp" },
    "4926": { nom: "Tableau simple", artiste: "Artiste X", date: "vers 1900", valeur: 3000, image: "placeholder.webp" },
    "8635": { nom: "Tableau cher", artiste: "Artiste X", date: "vers 1900", valeur: 15000, image: "placeholder.webp" },
    "0509": { nom: "Tableau très cher", artiste: "Artiste X", date: "vers 1900", valeur: 20000, image: "placeholder.webp" },
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
                    Merci d&apos;avoir joué !
                </button>
            </div>
        </div>
    );
}
