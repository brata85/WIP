'use client';

import React, { useState } from 'react';
import styles from '@/styles/CreateIdea.module.css';
import { useRouter } from 'next/navigation';

import { Upload, X } from 'lucide-react';
import { useIdeas } from '@/context/IdeaContext';

export default function CreateIdeaPage() {
    const router = useRouter();
    const { addIdea } = useIdeas();

    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('idea');
    const [images, setImages] = useState<string[]>([]);

    // Tab State
    const [activeTab, setActiveTab] = useState<'planning' | 'details' | 'roadmap'>('planning');
    const [content, setContent] = useState({
        planning: '',
        details: '',
        roadmap: ''
    });

    const TAB_CONFIG = [
        { id: 'planning', label: 'Planning', placeholder: 'Why did you start this project? What problem do you want to solve?' },
        { id: 'details', label: 'Details', placeholder: 'What are the specific features? How does it work?' },
        { id: 'roadmap', label: 'Roadmap', placeholder: 'What are your future plans? What is the current progress?' },
    ] as const;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addIdea({
            title: title,
            content: content,
            tags: [tags],
            author: 'You', // Placeholder for current user
            authorHandle: '@you',
            imageUrl: images[0], // First image as main
            images: images, // All images
        });

        router.push('/');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (images.length >= 3) return;

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages([...images, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleContentChange = (val: string) => {
        setContent(prev => ({ ...prev, [activeTab]: val }));
    }

    return (
        <div className={styles.container}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>Think. Build. Improve with feedback.</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label className={styles.label}>Project Title (Working Title)</label>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. AI-Powered Cat Translator"
                        required
                        maxLength={50}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />

                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Description</label>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {TAB_CONFIG.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: activeTab === tab.id ? 'var(--primary)' : 'var(--card-bg)',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        className={styles.textarea}
                        placeholder={TAB_CONFIG.find(t => t.id === activeTab)?.placeholder}
                        required={activeTab === 'planning'} // Only planning is required? or all? Let's make planning required at least.
                        maxLength={3000}
                        value={content[activeTab]}
                        onChange={e => handleContentChange(e.target.value)}
                        style={{ minHeight: '200px' }}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {content[activeTab].length} / 3000
                    </div>
                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Images (Max 3)</label>
                    <div className={styles.imageGrid}>
                        {images.map((img, index) => (
                            <div key={index} className={styles.imagePreviewWrapper}>
                                <img src={img} alt={`Preview ${index}`} className={styles.gridImage} />
                                <button type="button" onClick={() => removeImage(index)} className={styles.removeButton}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {images.length < 3 && (
                            <label className={styles.uploadBox}>
                                <Upload size={24} style={{ marginBottom: '0.25rem' }} />
                                <span style={{ fontSize: '0.8rem' }}>Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className={styles.hiddenInput}
                                />
                            </label>
                        )}
                    </div>
                </div>


                <div className={styles.group}>
                    <div className={styles.tagLabel}>Type</div>
                    <div className={styles.pillContainer}>
                        {[
                            { id: 'idea', label: 'Idea', emoji: '' },
                            { id: 'working', label: 'Working', emoji: '' },
                            { id: 'pre-launch', label: 'Pre-launch', emoji: '' },
                            { id: 'live', label: 'Live', emoji: '' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                className={`${styles.pill} ${tags === type.id ? styles.active : ''}`}
                                onClick={() => setTags(type.id)}
                                data-value={type.id}
                            >
                                {type.emoji && <span>{type.emoji}</span>}
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" className={styles.submitButton}>
                    Posting
                </button>
            </form>

        </div>
    );
}
