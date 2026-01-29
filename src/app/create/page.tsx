'use client';

import React, { useState } from 'react';
import styles from '@/styles/CreateIdea.module.css';
import { useRouter } from 'next/navigation';

import { Upload, X } from 'lucide-react';
import { useIdeas } from '@/context/IdeaContext';

export default function CreateIdeaPage() {
    const router = useRouter();
    const { addIdea } = useIdeas();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: 'idea'
    });
    const [images, setImages] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addIdea({
            title: formData.title,
            description: formData.description,
            tags: [formData.tags],
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

    return (
        <div className={styles.container}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>Share your Idea</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label className={styles.label}>Project Title</label>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. AI-Powered Cat Translator"
                        required
                        maxLength={40}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                </div>

                <div className={styles.group}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Describe your idea in detail..."
                        required
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
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
                            { id: 'idea', label: 'Idea', emoji: '💡' },
                            { id: 'working', label: 'Working', emoji: '🛠️' },
                            { id: 'pre-launch', label: 'Pre-launch', emoji: '🛫' },
                            { id: 'live', label: 'Live', emoji: '🚀' }
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                className={`${styles.pill} ${formData.tags === type.id ? styles.active : ''}`}
                                onClick={() => setFormData({ ...formData, tags: type.id })}
                                data-value={type.id}
                            >
                                <span>{type.emoji}</span>
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" className={styles.submitButton}>
                    Post Idea
                </button>
            </form>

        </div>
    );
}
