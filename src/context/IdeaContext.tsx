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
    userVotes: Record<string, 'like' | 'dislike'>;
    notifications: Notification[];
    addIdea: (idea: Omit<Idea, 'id' | 'likes' | 'dislikes' | 'comments' | 'createdAt'>) => void;
    getIdea: (id: string) => Idea | undefined;
    likeIdea: (id: string) => void;
    dislikeIdea: (id: string) => void;
    addComment: (id: string, content: string, author: string) => void;
    editIdea: (id: string, updates: Partial<Idea>) => void;
    editComment: (ideaId: string, commentId: string, newContent: string) => void;
    deleteIdea: (id: string) => void;
    deleteComment: (ideaId: string, commentId: string) => void;
    markAllNotificationsAsRead: () => void;
}


const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export function IdeaProvider({ children }: { children: ReactNode }) {
    const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
    const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});
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
                setUserVotes(JSON.parse(savedVotes));
            } catch (e) {
                console.error("Failed to parse saved votes", e);
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
                localStorage.setItem('antigravity_votes', JSON.stringify(userVotes));
                localStorage.setItem('antigravity_notifications', JSON.stringify(notifications));
            } catch (error) {
                console.error("Failed to save to localStorage (Quota Exceeded):", error);
                if (error instanceof DOMException &&
                    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    alert("Local storage is full! Your latest changes (likely large images) might not be saved. Please delete some items.");
                }
            }
        }
    }, [ideas, userVotes, notifications, isLoaded]);

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

    const addIdea = (newIdea: Omit<Idea, 'id' | 'likes' | 'dislikes' | 'comments' | 'createdAt'>) => {
        const idea: Idea = {
            ...newIdea,
            id: Math.random().toString(36).substr(2, 9),
            likes: 0,
            dislikes: 0,
            comments: [],
            createdAt: 'Just now',
            isNew: true,
        };
        setIdeas([idea, ...ideas]);
    };

    const getIdea = (id: string) => ideas.find(i => i.id === id);

    const likeIdea = (id: string) => {
        const currentVote = userVotes[id];
        const idea = ideas.find(i => i.id === id);

        if (idea && idea.author === 'You' && currentVote !== 'like') {
            addNotification('like', 'Someone liked your idea: ' + idea.title, id);
        }

        setIdeas(ideas.map(idea => {
            if (idea.id !== id) return idea;

            let newLikes = idea.likes;
            let newDislikes = idea.dislikes || 0;

            if (currentVote === 'like') {
                newLikes--;
            } else if (currentVote === 'dislike') {
                newDislikes--;
                newLikes++;
            } else {
                newLikes++;
            }

            return { ...idea, likes: newLikes, dislikes: newDislikes };
        }));

        setUserVotes(prev => {
            const next = { ...prev };
            if (currentVote === 'like') {
                delete next[id];
            } else {
                next[id] = 'like';
            }
            return next;
        });
    };

    const dislikeIdea = (id: string) => {
        const currentVote = userVotes[id];
        const idea = ideas.find(i => i.id === id);

        if (idea && idea.author === 'You' && currentVote !== 'dislike') {
            addNotification('dislike', 'Someone disliked your idea: ' + idea.title, id);
        }

        setIdeas(ideas.map(idea => {
            if (idea.id !== id) return idea;

            let newLikes = idea.likes;
            let newDislikes = idea.dislikes || 0;

            if (currentVote === 'dislike') {
                newDislikes--;
            } else if (currentVote === 'like') {
                newLikes--;
                newDislikes++;
            } else {
                newDislikes++;
            }

            return { ...idea, likes: newLikes, dislikes: newDislikes };
        }));

        setUserVotes(prev => {
            const next = { ...prev };
            if (currentVote === 'dislike') {
                delete next[id];
            } else {
                next[id] = 'dislike';
            }
            return next;
        });
    };


    const addComment = (id: string, content: string, author: string) => {
        const idea = ideas.find(i => i.id === id);
        // Notify if someone else comments on 'You'r idea, OR even if 'You' comment on your own idea for now (as requested "when comment is added")
        // But usually notify only if others comment. Assuming 'You' is the logged in user.
        // The user request: "내 글에 댓글이 달렸을때".
        // If I comment on my own post, I don't need a notification.
        // However, since we don't have real multi-user, 'author' param is passed.
        // In IdeaDetail, author passed is 'Me'.
        // So if idea.author === 'You' (my post) and created comment author is NOT 'You', trigger notification.
        // Wait, in IdeaDetail, addComment is called with author 'Me'.
        // Let's assume 'You' is the owner of the post.

        if (idea && idea.author === 'You') {
            addNotification('comment', `New comment on your idea: ${idea.title}`, id);
        }

        setIdeas(ideas.map(idea => {
            if (idea.id !== id) return idea;
            return {
                ...idea,
                comments: [
                    ...idea.comments,
                    {
                        id: Math.random().toString(),
                        author,
                        content,
                        createdAt: 'Just now'
                    }
                ]
            };
        }));
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
            userVotes,
            notifications,
            addIdea,
            getIdea,
            likeIdea,
            dislikeIdea,
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

