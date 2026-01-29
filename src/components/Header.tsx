import Link from 'next/link';
import { Plus, Bell, Search } from 'lucide-react';
import styles from '@/styles/Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.left}></div>

                <Link href="/" className={styles.logo}>
                    IdeaCast
                </Link>

                <nav className={styles.nav}>
                    <button className={styles.navItem}>
                        <Bell size={20} />
                    </button>
                </nav>
            </div>
        </header>
    );
}
