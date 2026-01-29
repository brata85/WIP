'use client';

import React, { useState } from 'react';
import { useIdeas } from '@/context/IdeaContext';
import IdeaCard from '@/components/IdeaCard';
import styles from '@/styles/MyPage.module.css';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export default function MyPage() {
    const { ideas } = useIdeas();
    const [activeTab, setActiveTab] = useState<'ideas' | 'comments'>('ideas');

    // Filter content
    // Assuming 'You' is the current user for ideas and 'Me' for comments as per previous logic
    const myIdeas = ideas.filter(idea => idea.author === 'You');

    const myComments = ideas.flatMap(idea =>
        idea.comments
            .filter(comment => comment.author === 'Me' || comment.author === 'You') // Include 'You' if they comment on own post
            .map(comment => ({
                ...comment,
                ideaTitle: idea.title,
                ideaId: idea.id
            }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Rough sort, string date might need handling but it's mock data

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>👻</div>
                <div className={styles.profileInfo}>
                    <h1>You</h1>
                    <div className={styles.handle}>@you</div>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{myIdeas.length}</span>
                            <span className={styles.statLabel}>Ideas</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{myComments.length}</span>
                            <span className={styles.statLabel}>Comments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'ideas' ? styles.active : ''}`}
                    onClick={() => setActiveTab('ideas')}
                >
                    My Ideas
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'comments' ? styles.active : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    My Comments
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {activeTab === 'ideas' && (
                    <div className={styles.list}>
                        {myIdeas.length > 0 ? (
                            myIdeas.map(idea => (
                                <IdeaCard key={idea.id} idea={idea} />
                            ))
                        ) : (
                            <div className={styles.empty}>
                                <h3>No ideas yet</h3>
                                <p>Share your first brilliant idea with the world!</p>
                                <Link href="/create" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    Create Idea
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className={styles.list}>
                        {myComments.length > 0 ? (
                            myComments.map((comment, index) => (
                                <Link key={comment.id + index} href={`/idea/${comment.ideaId}`} className={styles.commentItem}>
                                    <div className={styles.commentHeader}>
                                        <span className={styles.ideaTitle}>On: {comment.ideaTitle}</span>
                                        <span className={styles.commentDate}>{comment.createdAt}</span>
                                    </div>
                                    <p className={styles.commentContent}>{comment.content}</p>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.empty}>
                                <h3>No comments yet</h3>
                                <p>Join the discussion on some interesting ideas!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
