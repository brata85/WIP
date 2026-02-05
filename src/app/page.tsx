'use client';

// ... imports
import { useState, useEffect } from 'react';
import { useIdeas } from '@/context/IdeaContext';
import IdeaCard from '@/components/IdeaCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/styles/Search.module.css';

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_BUTTONS = 10;

export default function Home() {

  const { ideas } = useIdeas();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const filteredIdeas = ideas.filter(idea => {
    // 1. Search Filter
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.planning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.content.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.content.roadmap && idea.content.roadmap.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Type Filter
    const matchesType = activeFilter === 'all' || idea.tags.includes(activeFilter);

    return matchesSearch && matchesType;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredIdeas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentIdeas = filteredIdeas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate page numbers to display (Max 10)
  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = startPage + MAX_PAGE_BUTTONS - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: Scroll to top of grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filters = [
    { id: 'all', label: 'All', emoji: '' },
    { id: 'idea', label: 'Idea', emoji: '' },
    { id: 'working', label: 'Working', emoji: '' },
    { id: 'pre-launch', label: 'Pre-launch', emoji: '' },
    { id: 'live', label: 'Live', emoji: '' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 4rem 1rem' }}>

      {/* Header Area from Mockup */}
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        marginBottom: '2rem',
        background: 'linear-gradient(to right, #fff, #94a3b8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center'
      }}>
        IDEA FLOW
      </h1>

      {/* Search & Filters */}
      <div className={styles.searchContainer} style={{ marginBottom: '2rem' }}>
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
              {filter.emoji && <span>{filter.emoji}</span>}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
        marginBottom: '3rem'
      }}>
        {currentIdeas.length > 0 ? (
          currentIdeas.map((idea, index) => (
            // Make the first item span 2 columns ONLY on the FIRST page
            <div key={idea.id} style={(currentPage === 1 && index === 0) ? { gridColumn: 'span 2' } : {}}>
              <IdeaCard idea={idea} />
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
            <p>No ideas found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '12px',
                border: currentPage === pageNum ? '1px solid var(--primary)' : '1px solid transparent',
                background: currentPage === pageNum ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: currentPage === pageNum ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: currentPage === pageNum ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}


