'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useIdeas } from '@/context/IdeaContext';
import styles from '@/styles/IdeaDetail.module.css';
import { MessageSquare, ArrowLeft, Send, Upload, X, Star, StarHalf } from 'lucide-react';
import Link from 'next/link';

export default function IdeaDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getIdea, rateIdea, addComment, userRatings, editIdea, editComment, deleteIdea, deleteComment } = useIdeas();

    // Edit states
    // Edit states
    const [isEditingIdea, setIsEditingIdea] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [activeTab, setActiveTab] = useState<'planning' | 'details' | 'roadmap'>('planning');
    const [editContent, setEditContent] = useState({
        planning: '',
        details: '',
        roadmap: ''
    });
    const [editImages, setEditImages] = useState<string[]>([]);
    // State for image modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // ... comment states ...
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    // Local state for comment input
    const [newComment, setNewComment] = useState('');
    const [commentRating, setCommentRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    // Retrieve the idea
    const idea = getIdea(Array.isArray(id) ? id[0] : id!);

    const TAB_CONFIG = [
        { id: 'planning', label: 'Planning' },
        { id: 'details', label: 'Details' },
        { id: 'roadmap', label: 'Roadmap' },
    ] as const;

    // Initialize edit state when idea loads or changes
    useEffect(() => {
        if (idea) {
            setEditTitle(idea.title);
            // Handle backward compatibility if idea.content is missing (should not happen with new mock data)
            if (idea.content) {
                setEditContent(idea.content);
            } else {
                // Fallback if needed, though we updated mock data.
                // @ts-ignore
                setEditContent({ planning: idea.description || '', details: '', roadmap: '' });
            }
            const imgs = idea.images && idea.images.length > 0 ? idea.images : (idea.imageUrl ? [idea.imageUrl] : []);
            setEditImages(imgs);
        }
    }, [idea]);

    if (!idea) {
        // ... (existing error handling)
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Idea not found</h2>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Go back home</Link>
            </div>
        );
    }

    const userRating = userRatings[idea.id] || 0;

    const averageRating = idea.ratings && idea.ratings.length > 0
        ? idea.ratings.reduce((a, b) => a + b, 0) / idea.ratings.length
        : 0;

    const renderStars = (rating: number, size: number = 20) => {
        return (
            <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    if (rating >= star) {
                        return <Star key={star} size={size} fill="#fbbf24" color="#fbbf24" />;
                    } else if (rating >= star - 0.5) {
                        return (
                            <div key={star} style={{ position: 'relative', width: size, height: size }}>
                                <Star size={size} color="#fbbf24" style={{ position: 'absolute', opacity: 0.3 }} />
                                <StarHalf size={size} fill="#fbbf24" color="#fbbf24" style={{ position: 'absolute', left: 0, top: 0 }} />
                            </div>
                        );
                    } else {
                        return <Star key={star} size={size} color="#fbbf24" style={{ opacity: 0.3 }} />;
                    }
                })}
            </div>
        );
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addComment(idea.id, newComment, 'Me', commentRating > 0 ? commentRating : undefined);
        setNewComment('');
        setCommentRating(0);
    };

    // Edit Handlers
    const handleSaveIdea = () => {
        editIdea(idea.id, {
            title: editTitle,
            content: editContent,
            imageUrl: editImages[0] || undefined,
            images: editImages
        });
        setIsEditingIdea(false);
    };

    const handleDeleteIdea = () => {
        if (window.confirm('Are you sure you want to delete this idea?')) {
            deleteIdea(idea.id);
            router.push('/');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editImages.length >= 3) return;

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImages([...editImages, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setEditImages(editImages.filter((_, i) => i !== index));
    };

    const handleSaveComment = (commentId: string) => {
        editComment(idea.id, commentId, editCommentContent);
        setEditingCommentId(null);
    };

    const handleDeleteComment = (commentId: string) => {
        if (window.confirm('Delete this comment?')) {
            deleteComment(idea.id, commentId);
        }
    };

    const startEditingComment = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditCommentContent(comment.content);
    };

    const isAuthor = idea.author === 'You' || idea.author === 'Me';

    const displayImages = idea.images && idea.images.length > 0 ? idea.images : (idea.imageUrl ? [idea.imageUrl] : []);

    const handleContentChange = (val: string) => {
        setEditContent(prev => ({ ...prev, [activeTab]: val }));
    }

    // ... (render return ...)
    return (
        <div className={styles.container}>
            {/* ... back button and header ... */}
            <button onClick={() => router.back()} className={styles.backButton}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className={styles.card}>
                <div className={styles.header}>
                    {isEditingIdea ? (
                        <input
                            className={styles.editInput}
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            style={{ fontSize: '1.5rem', fontWeight: 800, width: '100%', marginBottom: '0.5rem' }}
                        />
                    ) : (
                        <h1 className={styles.title}>{idea.title}</h1>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className={styles.meta}>
                            <span className={styles.author}>{idea.author}</span>
                            <span className={styles.handle}>{idea.authorHandle}</span>
                            <span className={styles.date}>• {idea.createdAt}</span>
                        </div>

                        {!isEditingIdea && isAuthor && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => setIsEditingIdea(true)} className={styles.editButton}>
                                    Edit
                                </button>
                                <button onClick={handleDeleteIdea} className={styles.deleteButton}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Section (Keep as is) */}
                {isEditingIdea ? (
                    <div style={{ marginBottom: '2rem' }}>
                        <div className={styles.imageGrid}>
                            {editImages.map((img, index) => (
                                <div key={index} className={styles.imagePreviewWrapper}>
                                    <img src={img} alt={`Preview ${index}`} className={styles.gridImage} />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className={styles.removeButton}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {editImages.length < 3 && (
                                <label className={styles.uploadBox}>
                                    <Upload size={24} style={{ marginBottom: '0.25rem' }} />
                                    <span style={{ fontSize: '0.8rem' }}>Upload</span>
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                ) : (
                    displayImages.length > 0 && (
                        <div className={styles.imageGrid}>
                            {displayImages.map((img, index) => (
                                <div
                                    key={index}
                                    className={styles.imagePreviewWrapper}
                                    style={{ aspectRatio: 'auto', cursor: 'pointer' }}
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img src={img} alt={`Idea ${index}`} className={styles.gridImage} />
                                </div>
                            ))}
                        </div>
                    )
                )}


                {/* Content Body with Tabs */}
                <div className={styles.body}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        {TAB_CONFIG.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.5rem 0.25rem',
                                    fontSize: '1rem',
                                    fontWeight: activeTab === tab.id ? 700 : 500,
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-0.5rem',
                                        left: 0,
                                        width: '100%',
                                        height: '2px',
                                        background: 'var(--primary)'
                                    }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {isEditingIdea ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                                className={styles.editTextarea}
                                value={editContent[activeTab]}
                                onChange={e => handleContentChange(e.target.value)}
                                rows={10}
                                placeholder={`Enter ${TAB_CONFIG.find(t => t.id === activeTab)?.label}...`}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsEditingIdea(false)} className={styles.cancelButton}>Cancel</button>
                                <button onClick={handleSaveIdea} className={styles.saveButton}>Save</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ minHeight: '100px' }}>
                            {idea.content ? (
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, overflowWrap: 'anywhere', wordBreak: 'break-all' }}>{idea.content[activeTab] || 'No content provided.'}</p>
                            ) : (
                                <p>No content available.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions (Like/Dislike) */}
                {/* Actions (Score Display Only) */}
                <div style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            {/* Score Display (Left) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>Confidence</h3>
                                <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: 'var(--foreground)' }}>
                                    {averageRating.toFixed(1)}
                                </div>
                                {renderStars(averageRating, 24)}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    {idea.ratings?.length || 0} ratings
                                </span>
                            </div>

                            {/* Rating Distribution (Right) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center', minWidth: '200px' }}>
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = idea.ratings?.filter(r => Math.round(r) === star).length || 0;
                                    const total = idea.ratings?.length || 0;
                                    const percentage = total > 0 ? (count / total) * 100 : 0;

                                    return (
                                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                            <span style={{ width: '20px', textAlign: 'right', color: 'var(--text-muted)' }}>{star}★</span>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${percentage}%`, height: '100%', background: '#fbbf24', borderRadius: '3px' }} />
                                            </div>
                                            <span style={{ width: '30px', color: 'var(--text-muted)', textAlign: 'left' }}>{percentage.toFixed(0)}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className={styles.commentsSection}>
                <h3>Comments</h3>

                <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                    <textarea
                        className={styles.commentInput}
                        placeholder="What are your thoughts?"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rate this idea:</span>
                            <div
                                style={{ display: 'flex', gap: '0.25rem', cursor: 'pointer' }}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setCommentRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s'
                                        }}
                                        className={styles.starBtn}
                                    >
                                        <Star
                                            size={20}
                                            color={(hoverRating || commentRating) >= star ? "#fbbf24" : "#52525b"}
                                            fill={(hoverRating || commentRating) >= star ? "#fbbf24" : "none"}
                                            style={{
                                                opacity: (hoverRating || commentRating) >= star ? 1 : 0.5
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.postButton}
                            disabled={!newComment.trim()}
                            style={{ position: 'relative', bottom: 'auto', right: 'auto' }}
                        >
                            <Send size={16} /> Post
                        </button>
                    </div>
                </form>

                <div className={styles.commentList}>
                    {idea.comments.length > 0 ? (
                        idea.comments.map((comment) => {
                            const isOP = comment.author === idea.author || (idea.author === 'You' && comment.author === 'Me');

                            return (
                                <div key={comment.id} className={`${styles.comment} ${isOP ? styles.authorComment : ''}`}>
                                    <div className={styles.commentHeader}>
                                        <div>
                                            <span className={styles.commentAuthor}>
                                                {comment.author}
                                                {isOP && <span className={styles.authorBadge}>OWNER</span>}
                                            </span>
                                            {comment.rating && comment.rating > 0 && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.75rem', gap: '2px', fontSize: '0.85rem', color: '#fbbf24' }}>
                                                    {comment.rating} <Star size={12} fill="#fbbf24" />
                                                </span>
                                            )}
                                            <span className={styles.commentDate}>{comment.createdAt}</span>
                                        </div>
                                        {(comment.author === 'Me' || comment.author === 'You') && (
                                            editingCommentId !== comment.id && (
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                    <button onClick={() => startEditingComment(comment)} className={styles.editLink}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} className={styles.deleteLink}>
                                                        Delete
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className={styles.editCommentBox}>
                                            <textarea
                                                value={editCommentContent}
                                                onChange={e => setEditCommentContent(e.target.value)}
                                                className={styles.commentInput}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                                <button onClick={() => setEditingCommentId(null)} className={styles.cancelButton}>Cancel</button>
                                                <button onClick={() => handleSaveComment(comment.id)} className={styles.saveButton}>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={styles.commentContent}>{comment.content}</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className={styles.emptyState}>No comments yet. Be the first to share your thoughts!</p>
                    )}
                </div>
            </div>

            {/* Full Screen Image Modal */}
            {selectedImage && (
                <div className={styles.imageModalOverlay} onClick={() => setSelectedImage(null)}>
                    <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeModalButton} onClick={() => setSelectedImage(null)}>
                            <X size={24} /> Close
                        </button>
                        <img src={selectedImage} alt="Full screen" className={styles.fullImage} />
                    </div>
                </div>
            )}
        </div>
    );

}
