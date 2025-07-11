import { eventSystem, EVENTS } from './EventSystem';

/**
 * WinConditions - Manages game win/lose conditions and achievements
 */
export class WinConditions {
  constructor() {
    this.eventSystem = eventSystem;
    this.achievements = new Map();
    this.setupEventListeners();
    this.initializeAchievements();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on(EVENTS.TURN_END, (event) => {
      this.checkWinConditions(event.data.gameState);
      this.checkAchievements(event.data.gameState);
    });

    this.eventSystem.on('political:election', (event) => {
      this.handleElectionResult(event.data);
    });

    this.eventSystem.on('political:approval_change', (event) => {
      this.checkApprovalMilestones(event.data);
    });
  }

  /**
   * Initialize achievement definitions
   */
  initializeAchievements() {
    const achievements = [
      {
        id: 'popular_leader',
        title: 'Popular Leader',
        description: 'Maintain 70%+ approval rating for 12 consecutive weeks',
        icon: '⭐',
        type: 'approval',
        requirement: { threshold: 70, duration: 12 },
        unlocked: false
      },
      {
        id: 'economic_miracle',
        title: 'Economic Miracle',
        description: 'Achieve 5%+ GDP growth with unemployment below 4%',
        icon: '📈',
        type: 'economic',
        requirement: { gdpGrowth: 5, unemployment: 4 },
        unlocked: false
      },
      {
        id: 'crisis_manager',
        title: 'Crisis Manager',
        description: 'Successfully handle 3 political crises without losing more than 5% approval total',
        icon: '🛡️',
        type: 'crisis',
        requirement: { crises: 3, maxApprovalLoss: 5 },
        progress: { handledCrises: 0, totalApprovalLoss: 0 },
        unlocked: false
      },
      {
        id: 'diplomatic_master',
        title: 'Diplomatic Master',
        description: 'Achieve "Excellent" international standing',
        icon: '🌍',
        type: 'diplomatic',
        requirement: { standing: 'Excellent' },
        unlocked: false
      },
      {
        id: 'first_term_success',
        title: 'First Term Success',
        description: 'Complete your first term with 60%+ approval',
        icon: '🏆',
        type: 'milestone',
        requirement: { term: 1, approval: 60 },
        unlocked: false
      },
      {
        id: 'landslide_victory',
        title: 'Landslide Victory',
        description: 'Win an election with 65%+ approval',
        icon: '🎯',
        type: 'election',
        requirement: { approval: 65 },
        unlocked: false
      },
      {
        id: 'balanced_budget',
        title: 'Fiscal Responsibility',
        description: 'Reduce national debt below 50% of GDP',
        icon: '💰',
        type: 'economic',
        requirement: { debtRatio: 50 },
        unlocked: false
      },
      {
        id: 'policy_master',
        title: 'Policy Master',
        description: 'Successfully pass 10 major policy votes',
        icon: '📜',
        type: 'policy',
        requirement: { policies: 10 },
        progress: { passedPolicies: 0 },
        unlocked: false
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Check all win/lose conditions
   */
  checkWinConditions(gameState) {
    // Check for immediate loss conditions
    if (this.checkLossConditions(gameState)) {
      return; // Game ended
    }

    // Check for victory conditions
    this.checkVictoryConditions(gameState);
  }

  /**
   * Check for loss conditions
   */
  checkLossConditions(gameState) {
    const approval = gameState.politics.approval;
    const currentWeek = gameState.time.week;
    const currentYear = gameState.time.year;

    // Approval too low for too long
    if (approval < 15) {
      this.triggerGameEnd(gameState, {
        type: 'defeat',
        reason: 'approval_collapse',
        title: 'Government Collapse',
        description: `Your approval rating has collapsed to ${approval.toFixed(1)}%. The government has lost all confidence and you have been forced to resign.`,
        finalStats: this.getFinalStats(gameState)
      });
      return true;
    }

    // Economic collapse
    if (gameState.economy.unemployment > 15 && gameState.economy.gdpGrowth < -5) {
      this.triggerGameEnd(gameState, {
        type: 'defeat',
        reason: 'economic_collapse',
        title: 'Economic Collapse',
        description: `The economy has collapsed with ${gameState.economy.unemployment}% unemployment and ${gameState.economy.gdpGrowth}% GDP contraction. The country is in crisis and you have been removed from office.`,
        finalStats: this.getFinalStats(gameState)
      });
      return true;
    }

    // Political crisis threshold
    if (gameState.scandals && gameState.scandals.active.length >= 3) {
      const majorScandals = gameState.scandals.active.filter(s => s.severity === 'major').length;
      if (majorScandals >= 2) {
        this.triggerGameEnd(gameState, {
          type: 'defeat',
          reason: 'scandal_overload',
          title: 'Political Scandals',
          description: 'Multiple major scandals have overwhelmed your administration. Parliament has voted no confidence and you must resign.',
          finalStats: this.getFinalStats(gameState)
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Check for victory conditions
   */
  checkVictoryConditions(gameState) {
    const approval = gameState.politics.approval;
    const currentYear = gameState.time.year;

    // Successful completion of multiple terms
    if (currentYear >= 8 && approval >= 50) {
      this.triggerGameEnd(gameState, {
        type: 'victory',
        reason: 'successful_leadership',
        title: 'Successful Leadership',
        description: `Congratulations! You have successfully led the country for ${currentYear} years with a final approval rating of ${approval.toFixed(1)}%. Your legacy is secure.`,
        finalStats: this.getFinalStats(gameState)
      });
      return true;
    }

    // Exceptional approval for extended period
    if (approval >= 80 && currentYear >= 4) {
      this.triggerGameEnd(gameState, {
        type: 'victory',
        reason: 'beloved_leader',
        title: 'Beloved Leader',
        description: `You are universally beloved with an exceptional ${approval.toFixed(1)}% approval rating. You have achieved legendary status as a leader.`,
        finalStats: this.getFinalStats(gameState)
      });
      return true;
    }

    return false;
  }

  /**
   * Check for achievement unlocks
   */
  checkAchievements(gameState) {
    this.achievements.forEach((achievement, id) => {
      if (!achievement.unlocked) {
        if (this.isAchievementMet(achievement, gameState)) {
          this.unlockAchievement(id, gameState);
        }
      }
    });
  }

  /**
   * Check if an achievement requirement is met
   */
  isAchievementMet(achievement, gameState) {
    const approval = gameState.politics.approval;
    const economy = gameState.economy;

    switch (achievement.type) {
      case 'approval':
        // Track consecutive weeks above threshold
        if (!achievement.progress) {
          achievement.progress = { consecutiveWeeks: 0 };
        }
        
        if (approval >= achievement.requirement.threshold) {
          achievement.progress.consecutiveWeeks++;
        } else {
          achievement.progress.consecutiveWeeks = 0;
        }
        
        return achievement.progress.consecutiveWeeks >= achievement.requirement.duration;

      case 'economic':
        if (achievement.id === 'economic_miracle') {
          return economy.gdpGrowth >= achievement.requirement.gdpGrowth && 
                 economy.unemployment <= achievement.requirement.unemployment;
        }
        if (achievement.id === 'balanced_budget') {
          const debtRatio = (gameState.country.debt / gameState.country.gdp) * 100;
          return debtRatio < achievement.requirement.debtRatio;
        }
        break;

      case 'diplomatic':
        return gameState.global.internationalStanding === achievement.requirement.standing;

      case 'milestone':
        if (achievement.id === 'first_term_success') {
          return gameState.time.year >= 4 && approval >= achievement.requirement.approval;
        }
        break;

      case 'crisis':
        // This is handled in the crisis event handler
        if (!achievement.progress) {
          achievement.progress = { handledCrises: 0, totalApprovalLoss: 0 };
        }
        return achievement.progress.handledCrises >= achievement.requirement.crises &&
               achievement.progress.totalApprovalLoss <= achievement.requirement.maxApprovalLoss;

      case 'policy':
        if (!achievement.progress) {
          achievement.progress = { passedPolicies: 0 };
        }
        return achievement.progress.passedPolicies >= achievement.requirement.policies;
    }

    return false;
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId, gameState) {
    const achievement = this.achievements.get(achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = {
        week: gameState.time.week,
        year: gameState.time.year,
        timestamp: new Date().toISOString()
      };

      this.eventSystem.emit('achievement:unlocked', {
        achievement,
        gameState
      });

      // Add to events
      gameState.events.recent.unshift({
        id: Date.now(),
        title: `Achievement Unlocked: ${achievement.title}`,
        description: achievement.description,
        type: 'achievement',
        severity: 'positive',
        icon: achievement.icon,
        week: gameState.time.week,
        year: gameState.time.year,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle election results for win conditions
   */
  handleElectionResult(data) {
    const { result, approval, gameState } = data;

    // Check for election-based achievements
    if (result === 'victory' && approval >= 65) {
      this.unlockAchievement('landslide_victory', gameState);
    }

    // Election loss is a game end condition
    if (result === 'defeat') {
      this.triggerGameEnd(gameState, {
        type: 'defeat',
        reason: 'election_loss',
        title: 'Election Defeat',
        description: `You lost the election with ${approval.toFixed(1)}% approval. The people have chosen new leadership.`,
        finalStats: this.getFinalStats(gameState)
      });
    }
  }

  /**
   * Check approval milestones
   */
  checkApprovalMilestones(data) {
    const approval = data.newApproval;

    // Trigger crisis if approval gets very low
    if (approval <= 25) {
      this.eventSystem.emit('political:crisis', {
        gameState: data.gameState,
        crisis: {
          title: 'Confidence Crisis',
          description: 'Your low approval rating has triggered a confidence crisis.',
          approvalImpact: 2,
          requiresVote: false
        }
      });
    }
  }

  /**
   * Trigger game end
   */
  triggerGameEnd(gameState, endCondition) {
    gameState.gameEnded = true;
    gameState.endCondition = endCondition;

    this.eventSystem.emit('game:end', {
      gameState,
      endCondition
    });
  }

  /**
   * Get final statistics for game end
   */
  getFinalStats(gameState) {
    const timeInOffice = `${gameState.time.year} years, ${gameState.time.week} weeks`;
    const unlockedAchievements = Array.from(this.achievements.values())
      .filter(a => a.unlocked);

    return {
      timeInOffice,
      finalApproval: gameState.politics.approval,
      finalGDPGrowth: gameState.economy.gdpGrowth,
      finalUnemployment: gameState.economy.unemployment,
      finalInflation: gameState.economy.inflation,
      achievementsUnlocked: unlockedAchievements.length,
      achievements: unlockedAchievements,
      internationalStanding: gameState.global.internationalStanding
    };
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  /**
   * Reset achievements (for new game)
   */
  resetAchievements() {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.progress = achievement.type === 'crisis' ? { handledCrises: 0, totalApprovalLoss: 0 } :
                            achievement.type === 'policy' ? { passedPolicies: 0 } :
                            achievement.type === 'approval' ? { consecutiveWeeks: 0 } :
                            undefined;
      delete achievement.unlockedAt;
    });
  }
}

// Create and export singleton instance
export const winConditions = new WinConditions();