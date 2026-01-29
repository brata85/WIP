'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useIdeas } from '@/context/IdeaContext';
import styles from '@/styles/IdeaDetail.module.css';
import { ThumbsUp, ThumbsDown, MessageSquare, ArrowLeft, Send, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function IdeaDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { getIdea, likeIdea, dislikeIdea, addComment, userVotes, editIdea, editComment, deleteIdea, deleteComment } = useIdeas();

    // Edit states
    const [isEditingIdea, setIsEditingIdea] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editImages, setEditImages] = useState<string[]>([]);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    // Local state for comment input
    const [newComment, setNewComment] = useState('');

    // Retrieve the idea
    const idea = getIdea(Array.isArray(id) ? id[0] : id!);

    // Initialize edit state when idea loads or changes
    useEffect(() => {
        if (idea) {
            setEditTitle(idea.title);
            setEditDesc(idea.description);
            const imgs = idea.images && idea.images.length > 0 ? idea.images : (idea.imageUrl ? [idea.imageUrl] : []);
            setEditImages(imgs);
        }
    }, [idea]);

    if (!idea) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>Idea not found</h2>
                <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Go back home</Link>
            </div>
        );
    }

    const currentVote = userVotes[idea.id];

    const handleLike = () => likeIdea(idea.id);
    const handleDislike = () => dislikeIdea(idea.id);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addComment(idea.id, newComment, 'Me');
        setNewComment('');
    };

    // Edit Handlers
    const handleSaveIdea = () => {
        editIdea(idea.id, {
            title: editTitle,
            description: editDesc,
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

    return (
        <div className={styles.container}>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                            <h1 className={styles.title}>{idea.title}</h1>
                            {isAuthor && (
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
                    )}

                    <div className={styles.meta}>
                        <span className={styles.author}>{idea.author}</span>
                        <span className={styles.handle}>{idea.authorHandle}</span>
                        <span className={styles.date}>• {idea.createdAt}</span>
                    </div>
                </div>

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
                                <div key={index} className={styles.imagePreviewWrapper} style={{ aspectRatio: 'auto' }}>
                                    <img src={img} alt={`Idea ${index}`} className={styles.gridImage} />
                                </div>
                            ))}
                        </div>
                    )
                )}


                <div className={styles.body}>
                    {isEditingIdea ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                                className={styles.editTextarea}
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                rows={6}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsEditingIdea(false)} className={styles.cancelButton}>Cancel</button>
                                <button onClick={handleSaveIdea} className={styles.saveButton}>Save</button>
                            </div>
                        </div>
                    ) : (
                        <p className={styles.description}>{idea.description}</p>
                    )}
                </div>

                {/* Actions (Like/Dislike) */}
                <div className={styles.actions}>
                    <button
                        onClick={handleLike}
                        className={`${styles.actionButton} ${styles.like}`}
                        style={currentVote === 'like' ? { background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)' } : {}}
                    >
                        <ThumbsUp size={20} fill={currentVote === 'like' ? 'currentColor' : 'none'} />
                        <span>{idea.likes}</span>
                    </button>

                    <button
                        onClick={handleDislike}
                        className={`${styles.actionButton} ${styles.dislike}`}
                        style={currentVote === 'dislike' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } : {}}
                    >
                        <ThumbsDown size={20} fill={currentVote === 'dislike' ? 'currentColor' : 'none'} />
                        <span>{idea.dislikes || 0}</span>
                    </button>

                    <div className={styles.stat}>
                        <MessageSquare size={20} />
                        <span>{idea.comments.length} Comments</span>
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
                    <button
                        type="submit"
                        className={styles.postButton}
                        disabled={!newComment.trim()}
                    >
                        <Send size={16} /> Post
                    </button>
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
        </div>
    );

}
