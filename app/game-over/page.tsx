'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Les tableaux avec leurs infos - à synchroniser avec game/page.tsx
const tableauxData: Record<string, { nom: string; artiste: string; date: string; valeur: number; image: string }> = {
    "0384": { nom: "Nature morte aux raisins", artiste: "Maurice De Vlaminck", date: "1936", valeur: 12500, image: "/tableaux/placeholder.webp" },
    "7291": { nom: "Maternité", artiste: "Gaston Schnegg", date: "20ème siècle", valeur: 25000, image: "/tableaux/placeholder.webp" },
    "4607": { nom: "L'imagier", artiste: "Gaston Schnegg", date: "1942", valeur: 55000, image: "/tableaux/placeholder.webp" },
    "9152": { nom: "La leçon aux poupées", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 45000, image: "/tableaux/placeholder.webp" },
    "2846": { nom: "Jeanne Schnegg cousant", artiste: "Gaston Schnegg", date: "vers 1900", valeur: 35000, image: "/tableaux/placeholder.webp" },
    "6703": { nom: "Le Pont-Neuf, la nuit", artiste: "Albert Marquet", date: "1937", valeur: 75000, image: "/tableaux/placeholder.webp" },
    "1498": { nom: "Jardin au Pyla", artiste: "Albert Marquet", date: "1935", valeur: 60000, image: "/tableaux/placeholder.webp" },
    "5029": { nom: "La Rochelle", artiste: "Albert Marquet", date: "1920", valeur: 20000, image: "/tableaux/placeholder.webp" },
    "8361": { nom: "L'escadre alliée à Alger", artiste: "Albert Marquet", date: "1942", valeur: 30000, image: "/tableaux/placeholder.webp" },
    "7740": { nom: "La Seine à Herblay", artiste: "Albert Marquet", date: "1919", valeur: 35000, image: "/tableaux/placeholder.webp" },
    "0916": { nom: "Le Port de Marseille", artiste: "Albert Marquet", date: "1916", valeur: 48000, image: "/tableaux/placeholder.webp" },
    "3582": { nom: "Stockholm, la grue", artiste: "Albert Marquet", date: "1938", valeur: 25000, image: "/tableaux/placeholder.webp" },
    "6409": { nom: "L'hôpital Broca", artiste: "Maurice De Vlaminck", date: "1917", valeur: 35000, image: "/tableaux/placeholder.webp" },
    "2175": { nom: "Voiliers à Honfleur", artiste: "Félix Vallotton", date: "1913", valeur: 23000, image: "/tableaux/placeholder.webp" },
    "9843": { nom: "Petite fille à la guitare", artiste: "Marie Laurencin", date: "1940", valeur: 45000, image: "/tableaux/placeholder.webp" },
    "4031": { nom: "Conversation", artiste: "Louis Pierre Rigal", date: "1913", valeur: 55000, image: "/tableaux/placeholder.webp" },
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

                <p style={{ fontSize: '10px', opacity: 0.6, marginTop: '20px', textAlign: 'center' }}>
                    Les images finales et les bons codes seront tous prêts pour le jour J, le jeu n&apos;est pas complètement mis en place, il le sera pour la baccanight ! Un classement sera disponible également pour mesurer sa performance !
                </p>
            </div>
        </div>
    );
}
