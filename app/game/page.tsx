'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

const tableaux = [
    { code: "1234", nom: "Tableau 1", valeur: 5000, difficulte: 1, messageApres: "Message tab 1" },
    { code: "5678", nom: "Tableau 2", valeur: 8000, difficulte: 2, messageApres: "Message Tab 2" },
    { code: "9012", nom: "Tableau 3", valeur: 12000, difficulte: 3, messageApres: "Message tab 3" },
    { code: "3456", nom: "Tableau 4", valeur: 10000, difficulte: 2, messageApres: "Message tab 4" },
    { code: "7890", nom: "Tableau 5", valeur: 7000, difficulte: 1, messageApres: "Message tab 5" },
];

type GameState = 'code' | 'lockpick' | 'success' | 'penalty';

export default function Game() {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(true);
    const [gameState, setGameState] = useState<GameState>('code');
    const [currentTableau, setCurrentTableau] = useState<typeof tableaux[0] | null>(null);
    const [money, setMoney] = useState(0);
    const [message, setMessage] = useState("Fais attention je pense que la porte est fermée va falloir la crocheter, tout ce que t'as à faire c'est rentrer le code qu'il y'a en face de toi");
    const [stolenTableaux, setStolenTableaux] = useState<string[]>([]);
    const [alarmTriggered, setAlarmTriggered] = useState(false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    
    const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
    
    const [pickPosition, setPickPosition] = useState(0);
    const [pickDirection, setPickDirection] = useState(1);
    const [isPickMoving, setIsPickMoving] = useState(false);
    const [currentLockIndex, setCurrentLockIndex] = useState(0);
    const [totalLocks, setTotalLocks] = useState(1);
    const [lockTransition, setLockTransition] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(180);
    
    const [penaltyTime, setPenaltyTime] = useState(3);

    // Animation d'entrée de la notification
    useEffect(() => {
        setTimeout(() => setNotificationVisible(true), 300);
    }, []);

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

    const showNotification = (newMessage: string) => {
        setNotificationVisible(false);
        setTimeout(() => {
            setMessage(newMessage);
            setNotificationVisible(true);
        }, 200);
    };

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
            showNotification("Tu as déjà volé ce tableau ! Trouve-en un autre.");
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
            showNotification(`"À partir de là, tu auras 3min pour récupérer le plus de tableaux. Certains valent plus que d'autres mais sont plus difficile à récupérer, ton objectif : avoir le plus d'argent"`);
        } else {
            showNotification("Code invalide ! Vérifie le code sur le tableau.");
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
                showNotification(currentTableau.messageApres);
                
                if (!alarmTriggered) {
                    setAlarmTriggered(true);
                }
            } else {
                // Animation de transition entre cadenas
                setLockTransition(true);
                setIsPickMoving(false);
                setTimeout(() => {
                    setCurrentLockIndex(prev => prev + 1);
                    setLockTransition(false);
                    setPickPosition(0);
                    setIsPickMoving(true);
                }, 500);
                showNotification(`Cadenas ${currentLockIndex + 2}/${totalLocks} - Continue !`);
            }
        } else {
            setGameState('penalty');
            setPenaltyTime(3);
            showNotification("Raté ! Recommence !");
            
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
        showNotification(alarmTriggered 
            ? "Bouge toi ! Les gardes arrivent ! Trouve le prochain tableau."
            : "Bien joué ! Trouve le prochain tableau.");
    };

    const handleQuitLockpick = () => {
        setGameState('code');
        setCurrentTableau(null);
        setCodeInputs(['', '', '', '']);
        setCurrentLockIndex(0);
        setIsPickMoving(false);
        showNotification("Tu as abandonné ce tableau. Trouve-en un autre !");
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
            {/* Notification style iOS */}
            <div className={`${styles.notification} ${notificationVisible ? styles.notificationVisible : ''}`}>
                <div className={styles.notifHeader}>
                    <Image src="/complice.svg" alt="Complice" width={24} height={24} className={styles.notifIcon} />
                    <span className={styles.notifTitle}>COMPLICE</span>
                </div>
                <p className={styles.notifMessage}>{message}</p>
            </div>

            {gameState === 'code' && (
                <div className={styles.codeSection}>
                    {alarmTriggered && (
                        <div className={styles.timerDisplayCenter}>
                            <span className={`${styles.timerTextLarge} ${timeLeft <= 30 ? styles.timerDanger : ''}`}>
                                {formatTime(timeLeft)}
                            </span>
                            <div className={styles.timerBarLarge}>
                                <div 
                                    className={`${styles.timerProgressRed} ${timeLeft <= 30 ? styles.timerProgressDanger : ''}`}
                                    style={{ width: `${(timeLeft / 180) * 100}%` }}
                                />
                                <div 
                                    className={styles.timerProgressEmpty}
                                    style={{ width: `${100 - (timeLeft / 180) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.codeInputContainer}>
                        <div className={styles.codeInputs}>
                            {codeInputs.map((val, i) => (
                                <input
                                    key={i}
                                    id={`code-${i}`}
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={val}
                                    onChange={(e) => handleCodeInput(i, e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={styles.codeInput}
                                    maxLength={1}
                                    placeholder="0"
                                    autoComplete="off"
                                />
                            ))}
                        </div>
                        <Image src="/cadenas.svg" alt="Cadenas" width={28} height={28} className={styles.lockIconSmall} />
                    </div>
                    
                    <button className={styles.actionButton} onClick={handleValidateCode}>
                        <Image src="/fingerprint.svg" alt="" width={20} height={20} />
                        IDENTIFIER LE TABLEAU
                    </button>
                </div>
            )}

            {gameState === 'lockpick' && (
                <div className={styles.lockpickSection}>
                    <div className={styles.lockpickHeader}>
                        {alarmTriggered && (
                            <div className={styles.timerDisplaySmall}>
                                <span className={`${styles.timerTextSmall} ${timeLeft <= 30 ? styles.timerDanger : ''}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                        <button className={styles.quitButton} onClick={handleQuitLockpick}>
                            ✕
                        </button>
                    </div>

                    <div className={`${styles.lockVisual} ${lockTransition ? styles.lockSwipe : ''}`}>
                        <Image src="/cadenas.svg" alt="Cadenas" width={120} height={150} className={styles.lockImage} />
                        {totalLocks > 1 && (
                            <div className={styles.lockCounter}>
                                {currentLockIndex + 1} / {totalLocks}
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
                    <p className={styles.penaltyText}>Raté !</p>
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

            {gameState !== 'lockpick' && gameState !== 'penalty' && (
                <div className={styles.bagSection}>
                    <div className={styles.bagVisual}>
                        <Image src="/bag.svg" alt="Sac" width={200} height={200} className={styles.bagImage} />
                        <div className={styles.moneyDisplay}>
                            <span className={styles.dollarSign}>$</span>
                            <span className={styles.moneyAmount}>{money.toLocaleString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
