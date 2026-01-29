'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Trophy, User } from 'lucide-react';
import styles from '@/styles/BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { id: 'home', label: 'HOME', path: '/', icon: Home },
        { id: 'create', label: 'IDEA', path: '/create', icon: PlusCircle },
        { id: 'hall-of-fame', label: 'HOF', path: '/hall-of-fame', icon: Trophy },
        { id: 'my', label: 'MY', path: '/my', icon: User },
    ];

    return (
        <nav className={styles.bottomNav}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                    <Link
                        key={tab.id}
                        href={tab.path}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrapper}>
                            <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
