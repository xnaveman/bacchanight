'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TransitionContextType {
    isTransitioning: boolean;
    startTransition: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    isTransitioning: false,
    startTransition: () => {},
});

export const useTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const startTransition = useCallback((href: string) => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        
        // Attendre que les barres couvrent l'écran, puis naviguer
        setTimeout(() => {
            router.push(href);
            // Reset après navigation (l'overlay gère son propre état d'entrée)
            setTimeout(() => {
                setIsTransitioning(false);
            }, 100);
        }, 600);
    }, [isTransitioning, router]);

    return (
        <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}
