import { useCallback } from 'react';

/**
 * Custom hook for managing learning progress across all modes
 * Handles XP, achievements, and localStorage persistence
 */
export const useProgress = (state, setState) => {
  const addXP = useCallback((amount) => {
    setState(prev => ({
      ...prev,
      xp: prev.xp + amount
    }));
  }, [setState]);

  const trackModeProgress = useCallback((mode, data) => {
    setState(prev => ({
      ...prev,
      modeProgress: {
        ...prev.modeProgress,
        [mode]: {
          ...(prev.modeProgress?.[mode] || {}),
          ...data,
          lastStudied: new Date().toISOString()
        }
      }
    }));
  }, [setState]);

  const trackVocabularyMastery = useCallback((word, correct) => {
    setState(prev => {
      const wordData = prev.vocabularyMastery?.[word] || {
        timesCorrect: 0,
        timesWrong: 0,
        lastReviewed: null,
        masteryLevel: 0,
        modesUsed: []
      };

      const newTimesCorrect = correct ? wordData.timesCorrect + 1 : wordData.timesCorrect;
      const newTimesWrong = correct ? wordData.timesWrong : wordData.timesWrong + 1;
      const totalAttempts = newTimesCorrect + newTimesWrong;
      const masteryLevel = totalAttempts > 0 ? newTimesCorrect / totalAttempts : 0;

      return {
        ...prev,
        vocabularyMastery: {
          ...(prev.vocabularyMastery || {}),
          [word]: {
            timesCorrect: newTimesCorrect,
            timesWrong: newTimesWrong,
            lastReviewed: new Date().toISOString(),
            masteryLevel,
            modesUsed: wordData.modesUsed
          }
        }
      };
    });
  }, [setState]);

  const checkAchievement = useCallback((achievementId, condition) => {
    if (condition && !state.achievements?.includes(achievementId)) {
      setState(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), achievementId]
      }));
      return true; // Achievement unlocked
    }
    return false;
  }, [state.achievements, setState]);

  return {
    addXP,
    trackModeProgress,
    trackVocabularyMastery,
    checkAchievement
  };
};
