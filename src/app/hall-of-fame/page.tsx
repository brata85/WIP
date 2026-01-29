'use client';

import React from 'react';
import { useIdeas } from '@/context/IdeaContext';
import styles from '@/styles/HallOfFame.module.css';
import { Crown, Trophy, Medal } from 'lucide-react';

export default function HallOfFamePage() {
    const { ideas } = useIdeas();

    // Aggregate comments by author
    const authorStats = React.useMemo(() => {
        const stats: Record<string, number> = {};

        ideas.forEach(idea => {
            idea.comments.forEach(comment => {
                const author = comment.author;
                stats[author] = (stats[author] || 0) + 1;
            });
        });

        const sortedAuthors = Object.entries(stats)
            .map(([author, count]) => ({ author, count }))
            .sort((a, b) => b.count - a.count);

        return sortedAuthors;
    }, [ideas]);

    const top5 = authorStats.slice(0, 5);

    // Find "Me" or "You" ranking (assuming user is "Me" or "You" based on prev context)
    // In `IdeaCard` comments are added as "Me". In `CreatePage` ideas are added as "You".
    // Let's assume the user is "Me" for comments since the request is about "Feedback/Comments Ranking".
    const myName = "Me";
    const myRankIndex = authorStats.findIndex(s => s.author === myName);
    const myStat = myRankIndex !== -1 ? authorStats[myRankIndex] : { author: myName, count: 0 };
    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : '-';

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={24} color="#FFD700" fill="#FFD700" />;
        if (rank === 2) return <Trophy size={20} color="#C0C0C0" />;
        if (rank === 3) return <Medal size={20} color="#CD7F32" />;
        return <span className={styles.rankPosition}>{rank}</span>;
    };

    const getRankClass = (rank: number) => {
        if (rank === 1) return styles.rank1;
        if (rank === 2) return styles.rank2;
        if (rank === 3) return styles.rank3;
        return '';
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>🏆 Hall of Fame</h1>

            <div className={styles.list}>
                {top5.length > 0 ? (
                    top5.map((stat, index) => {
                        const rank = index + 1;
                        return (
                            <div key={stat.author} className={styles.rankCard}>
                                <div className={`${styles.rankPosition} ${getRankClass(rank)}`}>
                                    {getRankIcon(rank)}
                                </div>

                                <div className={styles.avatar}>
                                    {stat.author.charAt(0).toUpperCase()}
                                </div>

                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{stat.author}</span>
                                    <span className={styles.userStats}>
                                        Top Contributor
                                    </span>
                                </div>

                                <div className={styles.score}>
                                    <span className={styles.scoreValue}>{stat.count}</span>
                                    <span className={styles.scoreLabel}>Feedbacks</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                        No feedbacks yet. Be the first to analyze ideas!
                    </div>
                )}
            </div>

            <div className={styles.currentUserCard}>
                <div className={`${styles.rankCard} ${styles.myRankCard}`}>
                    <div className={styles.rankPosition} style={{ fontSize: '1rem' }}>
                        {typeof myRank === 'number' ? `#${myRank}` : '-'}
                    </div>

                    <div className={styles.avatar} style={{ background: 'var(--primary)', color: 'white' }}>
                        ME
                    </div>

                    <div className={styles.userInfo}>
                        <span className={styles.userName}>My Ranking</span>
                        <span className={styles.userStats}>
                            {myStat.count > 0 ? 'Keep it up!' : 'Start commenting to climb the ladder!'}
                        </span>
                    </div>

                    <div className={styles.score}>
                        <span className={styles.scoreValue}>{myStat.count}</span>
                        <span className={styles.scoreLabel}>Feedbacks</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
