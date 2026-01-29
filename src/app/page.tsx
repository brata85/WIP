'use client';

import { useState } from 'react';
import { useIdeas } from '@/context/IdeaContext';
import IdeaCard from '@/components/IdeaCard';
import { Search } from 'lucide-react';
import styles from '@/styles/Search.module.css';

export default function Home() {

  const { ideas } = useIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredIdeas = ideas.filter(idea => {
    // 1. Search Filter
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Type Filter
    const matchesType = activeFilter === 'all' || idea.tags.includes(activeFilter);

    return matchesSearch && matchesType;
  });

  const filters = [
    { id: 'all', label: 'All', emoji: '♾️' },
    { id: 'idea', label: 'Idea', emoji: '💡' },
    { id: 'working', label: 'Working', emoji: '🛠️' },
    { id: 'pre-launch', label: 'Pre-launch', emoji: '🛫' },
    { id: 'live', label: 'Live', emoji: '🚀' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Search & Filters */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterWrapper}>
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`${styles.filterPill} ${activeFilter === filter.id ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              data-type={filter.id}
            >
              <span>{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Idea List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No ideas found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


