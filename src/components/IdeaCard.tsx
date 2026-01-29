'use client';

import React from 'react';
import Link from 'next/link';
import { Idea } from '@/data/mockIdeas';
import styles from '@/styles/IdeaCard.module.css';
import { ThumbsUp, ThumbsDown, MessageSquare, Lightbulb, Zap, Hammer } from 'lucide-react';


interface IdeaCardProps {
    idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
    const isIdea = idea.tags.includes('idea');
    const isLive = idea.tags.includes('live');

    return (
        <Link href={`/idea/${idea.id}`} style={{ textDecoration: 'none' }}>
            <div className={styles.card}>
                <div className={styles.contentWrapper}>
                    <div className={styles.textContent}>
                        <div className={styles.header}>
                            <div style={{ flex: 1 }}>
                                <h3 className={styles.title}>{idea.title}</h3>

                                <div className={styles.meta}>
                                    <span className={styles.username}>{idea.author}</span>
                                    <span className={styles.username} style={{ opacity: 0.7 }}>{idea.authorHandle}</span>

                                    {isIdea && (
                                        <span className={`${styles.tag} ${styles.idea}`}>
                                            <span style={{ marginRight: 4 }}>💡</span> Idea
                                        </span>
                                    )}
                                    {idea.tags.includes('working') && (
                                        <span className={`${styles.tag} ${styles.working}`}>
                                            <span style={{ marginRight: 4 }}>🛠️</span> Working
                                        </span>
                                    )}
                                    {idea.tags.includes('pre-launch') && (
                                        <span className={`${styles.tag} ${styles['pre-launch']}`}>
                                            <span style={{ marginRight: 4 }}>🛫</span> Pre-launch
                                        </span>
                                    )}

                                    {isLive && (
                                        <span className={`${styles.tag} ${styles.live}`}>
                                            <span style={{ marginRight: 4 }}>🚀</span> Live
                                        </span>
                                    )}


                                </div>
                            </div>
                        </div>

                        <p className={styles.description}>{idea.description}</p>
                    </div>

                    {idea.imageUrl && (
                        <img src={idea.imageUrl} alt={idea.title} className={styles.image} />
                    )}
                </div>



                <div className={styles.footer}>
                    <div className={styles.action}>
                        <ThumbsUp size={16} />
                        <span>{idea.likes}</span>
                    </div>

                    <div className={styles.action}>
                        <ThumbsDown size={16} />
                        <span>{idea.dislikes || 0}</span>
                    </div>

                    <div className={styles.action}>
                        <MessageSquare size={16} />
                        <span>{idea.comments.length}</span>
                    </div>

                    <div className={styles.dot} />

                    <span>{idea.createdAt}</span>
                </div>
            </div>
        </Link>
    );
}
