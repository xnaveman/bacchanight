'use client';

import { useTransition } from './TransitionContext';
import { ReactNode, MouseEvent } from 'react';

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
}

export default function TransitionLink({ href, children, className }: TransitionLinkProps) {
    const { startTransition, isTransitioning } = useTransition();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (!isTransitioning) {
            startTransition(href);
        }
    };

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
