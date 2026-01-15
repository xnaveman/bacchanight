'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const tableaux = [
    { code: "MD36", nom: "Tableau 1", valeur: 5000, difficulte: 1, messageApres: "Message tab 1" },
    { code: "GS20", nom: "Tableau 2", valeur: 8000, difficulte: 2, messageApres: "Message Tab 2" },
    { code: "GS42", nom: "Tableau 3", valeur: 12000, difficulte: 3, messageApres: "Message tab 3" },
    { code: "GS00", nom: "Tableau 4", valeur: 10000, difficulte: 2, messageApres: "Message tab 4" },
    { code: "GS00", nom: "Tableau 5", valeur: 7000, difficulte: 1, messageApres: "Message tab 5" },
    { code: "AM37", nom: "Tableau 6", valeur: 71000, difficulte: 2, messageApres: "Message tab 6" },
    { code: "AM35", nom: "Tableau 7", valeur: 91000, difficulte: 3, messageApres: "Message tab 7" },
    { code: "FC30", nom: "Tableau 8", valeur: 21000, difficulte: 1, messageApres: "Message tab 8" },
    { code: "FR21", nom: "Tableau 9", valeur: 221000, difficulte: 1, messageApres: "Message tab 9" },

];

type GameState = 'code' | 'lockpick' | 'success' | 'penalty';

export default function Game() {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(true);
    const [gameState, setGameState] = useState<GameState>('code');
    const [currentTableau, setCurrentTableau] = useState<typeof tableaux[0] | null>(null);
    const [money, setMoney] = useState(0);
    const [message, setMessage] = useState("Message initial : premier vol de tableau");
    const [stolenTableaux, setStolenTableaux] = useState<string[]>([]);
    const [alarmTriggered, setAlarmTriggered] = useState(false);
    
    const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
    
    const [pickPosition, setPickPosition] = useState(0);
    const [pickDirection, setPickDirection] = useState(1);
    const [isPickMoving, setIsPickMoving] = useState(false);
    const [currentLockIndex, setCurrentLockIndex] = useState(0);
    const [totalLocks, setTotalLocks] = useState(1);
    
    const [timeLeft, setTimeLeft] = useState(180);
    
    const [penaltyTime, setPenaltyTime] = useState(3);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!alarmTriggered) return;
        
        if (timeLeft <= 0) {
            localStorage.setItem('gameResults', JSON.stringify({
                money,
                stolenTableaux,
                tableauxCount: stolenTableaux.length
            }));
            router.push('/game-over');
            return;
        }
        
        const timer = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [alarmTriggered, timeLeft, money, stolenTableaux, router]);

    useEffect(() => {
        if (gameState !== 'penalty') return;
        
        if (penaltyTime <= 0) {
            setPenaltyTime(3);
            setGameState('lockpick');
            setIsPickMoving(true);
            setPickPosition(0);
            return;
        }
        
        const timer = setInterval(() => {
            setPenaltyTime(t => t - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, penaltyTime]);

    useEffect(() => {
        if (!isPickMoving || gameState !== 'lockpick') return;
        
        const speed = 2.5;
        
        const interval = setInterval(() => {
            setPickPosition(prev => {
                let next = prev + pickDirection * speed;
                if (next >= 100) {
                    setPickDirection(-1);
                    return 100;
                }
                if (next <= 0) {
                    setPickDirection(1);
                    return 0;
                }
                return next;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [isPickMoving, gameState, pickDirection]);

    const handleCodeInput = (index: number, value: string) => {
        const newInputs = [...codeInputs];
        newInputs[index] = value.toUpperCase();
        setCodeInputs(newInputs);

        if (value && index < 3) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleValidateCode = () => {
        const code = codeInputs.join('');
        const found = tableaux.find(t => t.code === code);
        
        if (found && stolenTableaux.includes(found.code)) {
            setMessage("Tu as déjà volé ce tableau ! Trouve-en un autre.");
            setCodeInputs(['', '', '', '']);
            return;
        }
        
        if (found) {
            setCurrentTableau(found);
            setTotalLocks(found.difficulte);
            setCurrentLockIndex(0);
            setGameState('lockpick');
            setIsPickMoving(true);
            setPickPosition(0);
            setMessage(`${found.nom} - Valeur: ${found.valeur}$ - ${found.difficulte} cadenas à crocheter !`);
        } else {
            setMessage("Code invalide ! Vérifie le code sur le tableau.");
            setCodeInputs(['', '', '', '']);
        }
    };

    const handleLockpick = useCallback(() => {
        if (gameState !== 'lockpick' || !currentTableau) return;
        
        setIsPickMoving(false);
        
        const successStart = 40;
        const successEnd = 60;
        
        if (pickPosition >= successStart && pickPosition <= successEnd) {
            if (currentLockIndex + 1 >= totalLocks) {
                setMoney(m => m + currentTableau.valeur);
                setStolenTableaux(prev => [...prev, currentTableau.code]);
                setGameState('success');
                setMessage(currentTableau.messageApres);
                
                if (!alarmTriggered) {
                    setAlarmTriggered(true);
                }
            } else {
                setCurrentLockIndex(prev => prev + 1);
                setPickPosition(0);
                setIsPickMoving(true);
                setMessage(`Cadenas ${currentLockIndex + 2}/${totalLocks} - Continue !`);
            }
        } else {
            setGameState('penalty');
            setPenaltyTime(3);
            setMessage("Raté");
            
            if (alarmTriggered) {
                setTimeLeft(t => Math.max(0, t - 3));
            }
        }
    }, [gameState, currentTableau, pickPosition, currentLockIndex, totalLocks, alarmTriggered]);

    const handleNextTableau = () => {
        setGameState('code');
        setCurrentTableau(null);
        setCodeInputs(['', '', '', '']);
        setCurrentLockIndex(0);
        setMessage(alarmTriggered 
            ? "Bouge toi ! Les gardes arrivent ! Trouve le prochain tableau."
            : "Message initial.");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isMobile) {
        return (
            <div className={styles.desktopWarning}>
                <h1>Accès Mobile Uniquement</h1>
                <p>Ce jeu est uniquement accessible sur mobile</p>
                <p>Utilisez un téléphone pour jouer</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.notification}>
                <div className={styles.notifHeader}>
                    <span className={styles.notifTitle}>COMPLICE</span>
                    {alarmTriggered && (
                        <div className={styles.timerBadge}>
                            <span className={`${styles.timerValue} ${timeLeft <= 30 ? styles.timerDanger : ''}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}
                </div>
                <p className={styles.notifMessage}>{message}</p>
            </div>

            {gameState === 'code' && (
                <div className={styles.codeSection}>
                    <div className={styles.codeInputs}>
                        {codeInputs.map((val, i) => (
                            <input
                                key={i}
                                id={`code-${i}`}
                                type="text"
                                value={val}
                                onChange={(e) => handleCodeInput(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={styles.codeInput}
                                maxLength={1}
                                placeholder={i < 2 ? "A" : "0"}
                                autoComplete="off"
                            />
                        ))}
                    </div>
                    
                    <button className={styles.actionButton} onClick={handleValidateCode}>
                        IDENTIFIER LE TABLEAU
                    </button>
                </div>
            )}

            {gameState === 'lockpick' && (
                <div className={styles.lockpickSection}>
                    {alarmTriggered && (
                        <div className={styles.lockpickTimer}>
                            <span className={`${styles.timerText} ${timeLeft <= 30 ? styles.timerDanger : ''}`}>
                                {formatTime(timeLeft)}
                            </span>
                            <div className={styles.timerBarSmall}>
                                <div 
                                    className={styles.timerProgress} 
                                    style={{ width: `${(timeLeft / 180) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.lockIndicator}>
                        {Array.from({ length: totalLocks }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`${styles.lockDot} ${i < currentLockIndex ? styles.lockDone : ''} ${i === currentLockIndex ? styles.lockCurrent : ''}`}
                            />
                        ))}
                    </div>

                    <div className={styles.lockVisual}>
                        <div className={styles.lockBody}>
                            <div className={styles.lockShackle}></div>
                            <div className={styles.lockFace}>
                                <div className={styles.keyhole}></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.paperclipContainer}>
                        <svg className={styles.paperclip} viewBox="0 0 40 120">
                            <path 
                                d="M20 10 L20 100 Q20 110 10 110 Q0 110 0 100 L0 30 Q0 20 10 20 L30 20 Q40 20 40 30 L40 90 Q40 100 30 100 L20 100"
                                fill="none"
                                stroke="#C0C0C0"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <div className={styles.pickArea}>
                        <div className={styles.pickTrack}>
                            <div className={styles.successZone} />
                            <div 
                                className={styles.pickIndicator}
                                style={{ left: `${pickPosition}%` }}
                            />
                        </div>
                    </div>

                    <button className={styles.actionButtonYellow} onClick={handleLockpick}>
                        CROCHETER LA SERRURE
                    </button>
                </div>
            )}

            {gameState === 'penalty' && (
                <div className={styles.penaltySection}>
                    <div className={styles.penaltyCircle}>
                        <svg className={styles.penaltyRing} viewBox="0 0 100 100">
                            <circle 
                                cx="50" 
                                cy="50" 
                                r="45" 
                                fill="none" 
                                stroke="#333" 
                                strokeWidth="8"
                            />
                            <circle 
                                cx="50" 
                                cy="50" 
                                r="45" 
                                fill="none" 
                                stroke="#E74C3C" 
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(penaltyTime / 3) * 283} 283`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <span className={styles.penaltyNumber}>{penaltyTime}</span>
                    </div>
                    <p className={styles.penaltyText}>Trombone cassé !</p>
                    {alarmTriggered && <p className={styles.penaltySubtext}>-3 secondes</p>}
                </div>
            )}

            {gameState === 'success' && (
                <div className={styles.successSection}>
                    <div className={styles.successIcon}>✓</div>
                    <h2 className={styles.successTitle}>TABLEAU VOLÉ !</h2>
                    {currentTableau && (
                        <>
                            <p className={styles.successTableau}>{currentTableau.nom}</p>
                            <p className={styles.successValue}>+{currentTableau.valeur.toLocaleString()}$</p>
                        </>
                    )}
                    <button className={styles.actionButtonYellow} onClick={handleNextTableau}>
                        TABLEAU SUIVANT
                    </button>
                </div>
            )}

            <div className={styles.bagSection}>
                <div className={styles.bagInfo}>
                    <span className={styles.bagMoney}>{money.toLocaleString()}$</span>
                </div>
                <div className={styles.stolenList}>
                    {stolenTableaux.slice(-3).map((code, i) => (
                        <div key={i} className={styles.stolenItem}>{code}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
