'use client';

import React from 'react';
import Link from 'next/link';
import { Idea } from '@/data/mockIdeas';
import styles from '@/styles/IdeaCard.module.css';

interface IdeaCardProps {
    idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
    return (
        <Link href={`/idea/${idea.id}`} style={{ textDecoration: 'none', height: '100%', display: 'block' }}>
            <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, marginRight: '1rem', minWidth: 0 }}>
                        <div className={styles.label}>Trending Project:</div>
                        <h3 className={styles.title}>{idea.title}</h3>
                        <p className={styles.description}>
                            {idea.content?.planning || 'No description available for this project.'}
                        </p>
                    </div>

                    {(idea.images?.[0] || idea.imageUrl) && (
                        <div className={styles.thumbnailContainer}>
                            <img
                                src={idea.images?.[0] || idea.imageUrl}
                                alt={idea.title}
                                className={styles.thumbnail}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.voteButton}>
                        Feedback
                    </button>

                    <div className={styles.userInfo}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#fbbf24' }}>★</span>
                                {idea.ratings && idea.ratings.length > 0
                                    ? (idea.ratings.reduce((a, b) => a + b, 0) / idea.ratings.length).toFixed(1)
                                    : '0.0'}
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({idea.ratings?.length || 0})</span>
                            </span>
                        </div>
                        {/* Placeholder Avatar */}
                        <div className={styles.avatar} style={{ background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)' }} />
                        <span className={styles.userName}>{idea.author}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
