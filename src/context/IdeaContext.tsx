'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Idea, MOCK_IDEAS } from '@/data/mockIdeas';

export interface Notification {
    id: string;
    type: 'like' | 'dislike' | 'comment';
    message: string;
    read: boolean;
    createdAt: string;
    relatedIdeaId: string;
}

interface IdeaContextType {
    ideas: Idea[];
    userRatings: Record<string, number>;
    notifications: Notification[];
    addIdea: (idea: Omit<Idea, 'id' | 'ratings' | 'comments' | 'createdAt'>) => void;
    getIdea: (id: string) => Idea | undefined;
    rateIdea: (id: string, rating: number) => void;
    addComment: (id: string, content: string, author: string, rating?: number) => void;
    editIdea: (id: string, updates: Partial<Idea>) => void;
    editComment: (ideaId: string, commentId: string, newContent: string) => void;
    deleteIdea: (id: string) => void;
    deleteComment: (ideaId: string, commentId: string) => void;
    markAllNotificationsAsRead: () => void;
}


const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export function IdeaProvider({ children }: { children: ReactNode }) {
    const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
    const [userRatings, setUserRatings] = useState<Record<string, number>>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedIdeas = localStorage.getItem('antigravity_ideas');
        const savedVotes = localStorage.getItem('antigravity_votes');
        const savedNotifications = localStorage.getItem('antigravity_notifications');

        if (savedIdeas) {
            try {
                setIdeas(JSON.parse(savedIdeas));
            } catch (e) {
                console.error("Failed to parse saved ideas", e);
            }
        }
        if (savedVotes) {
            try {
                setUserRatings(JSON.parse(savedVotes));
            } catch (e) {
                console.error("Failed to parse saved ratings", e);
            }
        }
        if (savedNotifications) {
            try {
                setNotifications(JSON.parse(savedNotifications));
            } catch (e) {
                console.error("Failed to parse saved notifications", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('antigravity_ideas', JSON.stringify(ideas));
                localStorage.setItem('antigravity_votes', JSON.stringify(userRatings));
                localStorage.setItem('antigravity_notifications', JSON.stringify(notifications));
            } catch (error) {
                console.error("Failed to save to localStorage (Quota Exceeded):", error);
                if (error instanceof DOMException &&
                    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    alert("Local storage is full! Your latest changes (likely large images) might not be saved. Please delete some items.");
                }
            }
        }
    }, [ideas, userRatings, notifications, isLoaded]);

    const addNotification = (type: 'like' | 'dislike' | 'comment', message: string, relatedIdeaId: string) => {
        const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            message,
            read: false,
            createdAt: 'Just now', // Ideally real timestamp
            relatedIdeaId
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const addIdea = (newIdea: Omit<Idea, 'id' | 'ratings' | 'comments' | 'createdAt'>) => {
        const idea: Idea = {
            ...newIdea,
            id: Math.random().toString(36).substr(2, 9),
            ratings: [],
            comments: [],
            createdAt: 'Just now',
            isNew: true,
        };
        setIdeas([idea, ...ideas]);
    };

    const getIdea = (id: string) => ideas.find(i => i.id === id);

    const rateIdea = (id: string, rating: number) => {
        const previousRating = userRatings[id];

        setIdeas(ideas.map(idea => {
            if (idea.id !== id) return idea;

            // If user already rated, remove their old rating first
            let newRatings = [...(idea.ratings || [])];
            if (previousRating !== undefined) {
                // Trying to find and remove one instance of the previous rating.
                // Ideally we should track *who* rated what, but for now we rely on the local user state.
                // Since we don't have user IDs in ratings, we just remove one instance of the value.
                const index = newRatings.indexOf(previousRating);
                if (index > -1) {
                    newRatings.splice(index, 1);
                }
            }

            // Add new rating
            newRatings.push(rating);

            return { ...idea, ratings: newRatings };
        }));

        setUserRatings(prev => ({
            ...prev,
            [id]: rating
        }));

        // Notify author if highly rated (e.g., 4 or 5 stars)
        const idea = ideas.find(i => i.id === id);
        if (idea && idea.author === 'You' && rating >= 4 && previousRating === undefined) {
            addNotification('like', `Someone rated your idea ${rating} stars: ` + idea.title, id);
        }
    };


    const addComment = (id: string, content: string, author: string, rating?: number) => {
        const idea = ideas.find(i => i.id === id);
        // Notify if someone else comments on 'You'r idea
        if (idea && idea.author === 'You') {
            addNotification('comment', `New comment on your idea: ${idea.title}`, id);
        }

        const previousRating = userRatings[id];

        setIdeas(ideas.map(idea => {
            if (idea.id !== id) return idea;

            // If rating provided
            let newRatings = idea.ratings ? [...idea.ratings] : [];
            if (rating && rating > 0) {
                // Remove previous rating if exists (Enforce 1 rating per user)
                if (previousRating !== undefined) {
                    const index = newRatings.indexOf(previousRating);
                    if (index > -1) {
                        newRatings.splice(index, 1);
                    }
                }
                newRatings.push(rating);
            }

            return {
                ...idea,
                ratings: newRatings,
                comments: [
                    ...idea.comments,
                    {
                        id: Math.random().toString(),
                        author,
                        content,
                        createdAt: 'Just now',
                        rating: rating && rating > 0 ? rating : undefined
                    }
                ]
            };
        }));

        if (rating && rating > 0) {
            setUserRatings(prev => ({ ...prev, [id]: rating }));

            // Notify if highly rated
            if (idea && idea.author === 'You' && rating >= 4) {
                addNotification('like', `Someone rated your idea ${rating} stars: ` + idea.title, id);
            }
        }
    };

    const editIdea = (id: string, updates: Partial<Idea>) => {
        setIdeas(ideas.map(idea =>
            idea.id === id ? { ...idea, ...updates } : idea
        ));
    };

    const deleteIdea = (id: string) => {
        setIdeas(ideas.filter(idea => idea.id !== id));
    };

    const editComment = (ideaId: string, commentId: string, newContent: string) => {
        setIdeas(ideas.map(idea => {
            if (idea.id !== ideaId) return idea;
            return {
                ...idea,
                comments: idea.comments.map(comment =>
                    comment.id === commentId ? { ...comment, content: newContent } : comment
                )
            };
        }));
    };

    const deleteComment = (ideaId: string, commentId: string) => {
        setIdeas(ideas.map(idea => {
            if (idea.id !== ideaId) return idea;
            return {
                ...idea,
                comments: idea.comments.filter(comment => comment.id !== commentId)
            };
        }));
    };

    return (
        <IdeaContext.Provider value={{
            ideas,
            userRatings,
            notifications,
            addIdea,
            getIdea,
            rateIdea,
            addComment,
            editIdea,
            editComment,
            deleteIdea,
            deleteComment,
            markAllNotificationsAsRead
        }}>
            {children}
        </IdeaContext.Provider>
    );
}




export function useIdeas() {
    const context = useContext(IdeaContext);
    if (context === undefined) {
        throw new Error('useIdeas must be used within an IdeaProvider');
    }
    return context;
}

