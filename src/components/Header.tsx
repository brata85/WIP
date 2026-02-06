'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Bell, Search } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styles from '@/styles/Header.module.css';
import { useIdeas } from '@/context/IdeaContext';

export default function Header() {
    const { notifications, markAllNotificationsAsRead } = useIdeas();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleNotifications = () => {
        if (!showNotifications) {
            setShowNotifications(true);
            markAllNotificationsAsRead();
        } else {
            setShowNotifications(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.left}></div>

                <Link href="/" className={styles.logo}>
                    WIP
                </Link>

                <nav className={styles.nav}>
                    <ConnectButton
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                        showBalance={false}
                        chainStatus="icon"
                    />

                    <div className={styles.notificationWrapper} ref={dropdownRef}>
                        <button
                            className={`${styles.navItem} ${showNotifications ? styles.active : ''}`}
                            onClick={toggleNotifications}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className={styles.notificationBadge}>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className={styles.notificationDropdown}>
                                <div className={styles.notificationHeader}>
                                    <h3>Notifications</h3>
                                </div>
                                <div className={styles.notificationList}>
                                    {notifications.length > 0 ? (
                                        notifications.map(notification => (
                                            <Link
                                                href={`/idea/${notification.relatedIdeaId}`}
                                                key={notification.id}
                                                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                <p>{notification.message}</p>
                                                <span className={styles.notificationMeta}>{notification.createdAt}</span>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className={styles.emptyNotification}>
                                            No notifications yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
