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

interface TransitionProviderProps {
    children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const startTransition = useCallback((href: string) => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        
        // Attendre la fin de l'animation de sortie avant de naviguer
        setTimeout(() => {
            router.push(href);
            
            // Fin de l'animation d'entrée
            setTimeout(() => {
                setIsTransitioning(false);
            }, 900);
        }, 800);
    }, [isTransitioning, router]);

    return (
        <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}
