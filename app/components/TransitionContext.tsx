'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface TransitionContextType {
    isTransitioning: boolean;
    isNavigating: boolean;
    startTransition: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    isTransitioning: false,
    isNavigating: false,
    startTransition: () => {},
});

export const useTransition = () => useContext(TransitionContext);

interface TransitionProviderProps {
    children: ReactNode;
}

export function TransitionProvider({ children }: TransitionProviderProps) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Détecter le changement de page
    useEffect(() => {
        if (isNavigating) {
            setIsNavigating(false);
            // Laisser un petit délai pour que la page se charge
            setTimeout(() => {
                setIsTransitioning(false);
            }, 100);
        }
    }, [pathname, isNavigating]);

    const startTransition = useCallback((href: string) => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        
        // Attendre la fin de l'animation de sortie avant de naviguer
        setTimeout(() => {
            setIsNavigating(true);
            router.push(href);
        }, 800);
    }, [isTransitioning, router]);

    return (
        <TransitionContext.Provider value={{ isTransitioning, isNavigating, startTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}
