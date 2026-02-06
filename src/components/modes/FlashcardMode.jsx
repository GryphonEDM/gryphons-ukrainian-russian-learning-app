import React, { useState, useEffect, useCallback } from 'react';

/**
 * Flashcard Mode Component
 * Practice vocabulary with flashcard-style learning
 * Features: flip cards, spaced repetition, progress tracking
 */
export default function FlashcardMode({
  vocabularySet,
  ttsEnabled,
  ttsVolume,
  onSpeak,
  onComplete,
  onExit,
  onAddXP,
  onTrackProgress
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredWords, setMasteredWords] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [sessionStats, setSessionStats] = useState({ studied: 0, mastered: 0 });

  const currentWord = vocabularySet.words[currentIndex];
  const totalWords = vocabularySet.words.length;
  const progress = ((currentIndex + 1) / totalWords) * 100;

  // Color map for color-themed flashcards
  const COLOR_MAP = {
    'red': '#e74c3c', 'blue': '#2980b9', 'yellow': '#f1c40f', 'green': '#27ae60',
    'white': '#ecf0f1', 'black': '#2c3e50', 'gray': '#95a5a6', 'brown': '#8b4513',
    'pink': '#ff69b4', 'orange': '#ff8c00', 'purple': '#8e44ad', 'violet': '#8e44ad',
    'light blue': '#87ceeb', 'beige': '#f5f5dc', 'burgundy': '#800020', 'maroon': '#800000',
    'gold': '#ffd700', 'golden': '#ffd700', 'silver': '#c0c0c0', 'turquoise': '#40e0d0',
    'crimson': '#dc143c', 'cream': '#fffdd0', 'lime green': '#32cd32', 'bronze': '#cd7f32'
  };
  const isColorSet = vocabularySet.setId === 'colors';
  const colorValue = isColorSet ? COLOR_MAP[currentWord?.en?.toLowerCase()] : null;
  const colorTextColor = colorValue && ['#f1c40f', '#ecf0f1', '#ffd700', '#87ceeb', '#f5f5dc', '#fffdd0', '#c0c0c0', '#40e0d0'].includes(colorValue) ? '#1a1a2e' : '#fff';

  // Initialize review queue with all words
  useEffect(() => {
    if (vocabularySet && vocabularySet.words) {
      setReviewQueue(vocabularySet.words.map((_, idx) => idx));
    }
  }, [vocabularySet]);

  // Speak English word using browser's built-in speech synthesis
  const speakEnglish = useCallback((text) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.split('/')[0].trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.volume = ttsVolume || 0.8;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, ttsVolume]);

  // Auto-speak English word when a new card appears (English side shown)
  useEffect(() => {
    if (!isFlipped && currentWord && ttsEnabled) {
      const timer = setTimeout(() => {
        speakEnglish(currentWord.en);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && ttsEnabled && onSpeak) {
      // Pronounce when flipping to Ukrainian side
      onSpeak(currentWord.uk, 0.8, ttsVolume);
    }
  };

  const handleKnowIt = () => {
    // Mark as mastered
    if (!masteredWords.includes(currentIndex)) {
      setMasteredWords([...masteredWords, currentIndex]);
      setSessionStats(prev => ({ ...prev, mastered: prev.mastered + 1 }));

      // Award XP
      if (onAddXP) {
        onAddXP(vocabularySet.xpPerWord || 15);
      }

      // Track progress
      if (onTrackProgress) {
        onTrackProgress('flashcards', {
          setId: vocabularySet.setId,
          word: currentWord.uk,
          mastered: true
        });
      }
    }

    // Remove from review queue
    setReviewQueue(prev => prev.filter(idx => idx !== currentIndex));

    moveToNext();
  };

  const handleReviewAgain = () => {
    // Add back to review queue if not already there
    if (!reviewQueue.includes(currentIndex)) {
      setReviewQueue(prev => [...prev, currentIndex]);
    }

    moveToNext();
  };

  const moveToNext = () => {
    setIsFlipped(false);
    setSessionStats(prev => ({ ...prev, studied: prev.studied + 1 }));

    if (currentIndex < totalWords - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reached end of set
      if (reviewQueue.length > 0) {
        // Go back to first word in review queue
        setCurrentIndex(reviewQueue[0]);
      } else {
        // All words mastered - complete!
        if (onComplete) {
          onComplete({
            setId: vocabularySet.setId,
            totalWords,
            masteredWords: masteredWords.length,
            sessionStats
          });
        }
      }
    }
  };

  const handlePronounce = () => {
    if (ttsEnabled && onSpeak) {
      onSpeak(currentWord.uk, 0.8, ttsVolume);
    }
  };

  if (!currentWord) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onExit}>
          ← Back
        </button>
        <div style={styles.headerInfo}>
          <h2 style={styles.title}>
            {vocabularySet.icon} {vocabularySet.nameEn} / {vocabularySet.nameUk}
          </h2>
          <p style={styles.subtitle}>Difficulty: {vocabularySet.difficulty}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progress}%`}}></div>
        </div>
        <div style={styles.progressText}>
          {currentIndex + 1} / {totalWords} words
        </div>
      </div>

      {/* Session Stats */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Studied:</span>
          <span style={styles.statValue}>{sessionStats.studied}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Mastered:</span>
          <span style={styles.statValue}>{sessionStats.mastered}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Review Queue:</span>
          <span style={styles.statValue}>{reviewQueue.length}</span>
        </div>
      </div>

      {/* Flashcard */}
      <div
        style={styles.cardContainer}
        onClick={handleFlip}
      >
        <div style={{
          ...styles.card,
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front (English) */}
          <div style={{
            ...styles.cardFace,
            ...styles.cardFront,
            ...(colorValue ? { background: colorValue, color: colorTextColor } : {}),
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}>
            <div style={{...styles.cardLabel, ...(colorValue ? { color: colorTextColor, opacity: 0.7 } : {})}}>English</div>
            <div style={{...styles.cardWord, ...(colorValue ? { color: colorTextColor } : {})}}>{currentWord.en}</div>
            <div style={{...styles.cardHint, ...(colorValue ? { color: colorTextColor, opacity: 0.6 } : {})}}>Click to see Ukrainian →</div>
          </div>

          {/* Back (Ukrainian) */}
          <div style={{
            ...styles.cardFace,
            ...styles.cardBack,
            ...(colorValue ? { background: colorValue, color: colorTextColor } : {}),
            transform: 'rotateY(180deg)',
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}>
            <div style={{...styles.cardLabel, ...(colorValue ? { color: colorTextColor, opacity: 0.7 } : {})}}>Українська</div>
            <div style={{...styles.cardWord, ...(colorValue ? { color: colorTextColor } : {})}}>{currentWord.uk}</div>
            <div style={{...styles.cardPhonetic, ...(colorValue ? { color: colorTextColor } : {})}}>({currentWord.phonetic})</div>
            {currentWord.examples && currentWord.examples.length > 0 && (
              <div style={styles.examples}>
                {currentWord.examples.map((ex, idx) => (
                  <div key={idx} style={styles.example}>{ex}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isFlipped && (
        <div style={styles.actions}>
          <button
            style={{...styles.button, ...styles.pronounceButton}}
            onClick={(e) => { e.stopPropagation(); handlePronounce(); }}
          >
            🔊 Hear it again
          </button>
          <button
            style={{...styles.button, ...styles.reviewButton}}
            onClick={(e) => { e.stopPropagation(); handleReviewAgain(); }}
          >
            📝 Review Again
          </button>
          <button
            style={{...styles.button, ...styles.knowButton}}
            onClick={(e) => { e.stopPropagation(); handleKnowIt(); }}
          >
            ✓ Know it!
          </button>
        </div>
      )}

      {!isFlipped && (
        <div style={styles.flipHint}>
          💡 Click the card to flip it
        </div>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem'
  },
  backButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s'
  },
  headerInfo: {
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    color: '#ffd700'
  },
  subtitle: {
    margin: '0.25rem 0 0 0',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem'
  },
  progressContainer: {
    marginBottom: '1.5rem'
  },
  progressBar: {
    width: '100%',
    height: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '0.5rem'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffd700'
  },
  cardContainer: {
    perspective: '1000px',
    marginBottom: '2rem',
    cursor: 'pointer'
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    height: '400px',
    margin: '0 auto',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
    borderRadius: '20px'
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    transition: 'opacity 0.3s'
  },
  cardFront: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  cardBack: {
    background: 'linear-gradient(135deg, #0057b7 0%, #ffd700 100%)'
  },
  cardLabel: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '1rem',
    opacity: 0.8
  },
  cardWord: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  cardPhonetic: {
    fontSize: '1.2rem',
    opacity: 0.9,
    marginBottom: '1.5rem'
  },
  cardHint: {
    fontSize: '0.9rem',
    opacity: 0.7,
    marginTop: '2rem'
  },
  examples: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  example: {
    fontSize: '1rem',
    opacity: 0.8,
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  button: {
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  pronounceButton: {
    background: 'linear-gradient(135deg, #4dabf7, #339af0)',
    color: '#fff'
  },
  reviewButton: {
    background: 'linear-gradient(135deg, #ffa94d, #fd7e14)',
    color: '#fff'
  },
  knowButton: {
    background: 'linear-gradient(135deg, #51cf66, #37b24d)',
    color: '#fff'
  },
  flipHint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1rem',
    marginTop: '1rem'
  }
};
