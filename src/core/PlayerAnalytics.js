import { eventSystem, EVENTS } from './EventSystem';

/**
 * PlayerAnalytics - Track player behavior, performance, and retention metrics
 * Analyzes decision patterns, policy effectiveness, and learning progression
 */
export class PlayerAnalytics {
  constructor() {
    this.sessionData = this.initializeSession();
    this.playerMetrics = this.loadPlayerMetrics();
    this.retentionData = this.loadRetentionData();
    this.performanceData = this.loadPerformanceData();

    this.initializeEventListeners();
    this.startSessionTracking();
  }

  /**
   * Initialize new session data
   */
  initializeSession() {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      decisions: [],
      policies: [],
      turnsPlayed: 0,
      approvalChanges: [],
      economicEvents: [],
      crisisesHandled: [],
      gameEnded: false,
      endCondition: null,
      difficulty: 'normal',
      tutorialCompleted: false,
    };
  }

  /**
   * Load or initialize player metrics
   */
  loadPlayerMetrics() {
    const stored = localStorage.getItem('sp_sim_player_metrics');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      totalSessions: 0,
      totalPlaytime: 0, // minutes
      averageSessionLength: 0,
      gamesCompleted: 0,
      gamesAbandoned: 0,
      retentionRate: 0,

      // Decision making patterns
      decisionSpeed: [], // time taken per decision
      decisionTypes: {}, // count of each decision type
      policyPreferences: {}, // preferred policy types

      // Performance metrics
      averageApproval: [],
      economicPerformance: [],
      crisisManagementScore: 0,
      learningProgression: 0,

      // Behavioral patterns
      sessionTimes: [], // when player typically plays
      preferredDifficulty: 'normal',
      featureUsage: {}, // which features are used most

      lastUpdated: Date.now(),
    };
  }

  /**
   * Load retention data
   */
  loadRetentionData() {
    const stored = localStorage.getItem('sp_sim_retention_data');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      firstSession: Date.now(),
      lastSession: Date.now(),
      sessionsPerDay: [],
      weeklyRetention: [],
      monthlyRetention: [],
      returningPlayer: false,
      churnRisk: 'low', // low, medium, high
      engagementScore: 0,
    };
  }

  /**
   * Load performance benchmarking data
   */
  loadPerformanceData() {
    const stored = localStorage.getItem('sp_sim_performance_data');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      loadTimes: [],
      memoryUsage: [],
      fps: [],
      turnProcessingTime: [],
      uiResponseTime: [],
      errorRate: 0,
      performanceScore: 100,
    };
  }

  /**
   * Start session tracking
   */
  startSessionTracking() {
    this.updateRetentionMetrics();
    this.trackSessionStart();

    // Track activity every 30 seconds
    this.activityInterval = setInterval(() => {
      this.trackActivity();
    }, 30000);

    // Auto-save analytics every 2 minutes
    this.saveInterval = setInterval(() => {
      this.saveAnalytics();
    }, 120000);
  }

  /**
   * End current session
   */
  endSession() {
    this.sessionData.endTime = Date.now();
    this.sessionData.duration = this.sessionData.endTime - this.sessionData.startTime;

    this.updatePlayerMetrics();
    this.saveAnalytics();

    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
  }

  /**
   * Track a player decision
   */
  trackDecision(decision) {
    const decisionData = {
      timestamp: Date.now(),
      type: decision.type || 'general',
      description: decision.description || decision.message,
      timeTaken: decision.timeTaken || 0, // milliseconds
      context: {
        turn: decision.turn,
        approval: decision.approval,
        economicState: decision.economicState,
      },
    };

    this.sessionData.decisions.push(decisionData);

    // Update decision metrics
    if (!this.playerMetrics.decisionTypes[decisionData.type]) {
      this.playerMetrics.decisionTypes[decisionData.type] = 0;
    }
    this.playerMetrics.decisionTypes[decisionData.type] += 1;

    if (decisionData.timeTaken > 0) {
      this.playerMetrics.decisionSpeed.push(decisionData.timeTaken);
    }

    eventSystem.emit('analytics:decision_tracked', { decision: decisionData });
  }

  /**
   * Track policy implementation
   */
  trackPolicy(policy) {
    const policyData = {
      timestamp: Date.now(),
      type: policy.type,
      name: policy.name,
      effectiveness: policy.effectiveness || 0,
      cost: policy.cost || 0,
      duration: policy.duration || 0,
      approvalImpact: policy.approvalImpact || 0,
    };

    this.sessionData.policies.push(policyData);

    // Update policy preferences
    if (!this.playerMetrics.policyPreferences[policyData.type]) {
      this.playerMetrics.policyPreferences[policyData.type] = 0;
    }
    this.playerMetrics.policyPreferences[policyData.type] += 1;

    eventSystem.emit('analytics:policy_tracked', { policy: policyData });
  }

  /**
   * Track approval rating changes
   */
  trackApprovalChange(oldApproval, newApproval, reason) {
    const change = {
      timestamp: Date.now(),
      from: oldApproval,
      to: newApproval,
      delta: newApproval - oldApproval,
      reason: reason || 'unknown',
    };

    this.sessionData.approvalChanges.push(change);
    this.playerMetrics.averageApproval.push(newApproval);

    eventSystem.emit('analytics:approval_tracked', { change });
  }

  /**
   * Track crisis management
   */
  trackCrisisHandled(crisis, outcome) {
    const crisisData = {
      timestamp: Date.now(),
      type: crisis.type,
      severity: crisis.severity,
      outcome: outcome.success ? 'success' : 'failure',
      score: outcome.score || 0,
      responseTime: outcome.responseTime || 0,
    };

    this.sessionData.crisisesHandled.push(crisisData);

    // Update crisis management score
    const recentCrises = this.sessionData.crisisesHandled.slice(-10);
    const successRate = recentCrises.filter((c) => c.outcome === 'success').length / recentCrises.length;
    this.playerMetrics.crisisManagementScore = Math.round(successRate * 100);

    eventSystem.emit('analytics:crisis_tracked', { crisis: crisisData });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature) {
    if (!this.playerMetrics.featureUsage[feature]) {
      this.playerMetrics.featureUsage[feature] = 0;
    }
    this.playerMetrics.featureUsage[feature] += 1;

    eventSystem.emit('analytics:feature_tracked', { feature });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics) {
    if (metrics.loadTime) {
      this.performanceData.loadTimes.push({
        timestamp: Date.now(),
        value: metrics.loadTime,
      });
    }

    if (metrics.memoryUsage) {
      this.performanceData.memoryUsage.push({
        timestamp: Date.now(),
        value: metrics.memoryUsage,
      });
    }

    if (metrics.fps) {
      this.performanceData.fps.push({
        timestamp: Date.now(),
        value: metrics.fps,
      });
    }

    // Calculate performance score (100 = perfect, 0 = terrible)
    this.updatePerformanceScore();
  }

  /**
   * Get comprehensive analytics data
   */
  getAnalytics() {
    return {
      session: this.sessionData,
      player: this.playerMetrics,
      retention: this.retentionData,
      performance: this.performanceData,
      insights: this.generateInsights(),
    };
  }

  /**
   * Get player performance summary
   */
  getPlayerPerformance() {
    const avgApproval = this.playerMetrics.averageApproval.length > 0
      ? this.playerMetrics.averageApproval.reduce((a, b) => a + b, 0) / this.playerMetrics.averageApproval.length
      : 0;

    const avgSessionLength = this.playerMetrics.totalPlaytime / Math.max(1, this.playerMetrics.totalSessions);

    const completionRate = this.playerMetrics.gamesCompleted
      / Math.max(1, this.playerMetrics.gamesCompleted + this.playerMetrics.gamesAbandoned);

    // Calculate overall score directly here to avoid circular dependency
    const overallScore = Math.round((
      avgApproval * 0.3
      + this.playerMetrics.crisisManagementScore * 0.2
      + this.playerMetrics.learningProgression * 0.2
      + (completionRate * 100) * 0.3
    ));

    return {
      overallScore,
      averageApproval: Math.round(avgApproval),
      sessionLength: Math.round(avgSessionLength),
      completionRate: Math.round(completionRate * 100),
      crisisManagement: this.playerMetrics.crisisManagementScore,
      learningProgression: this.playerMetrics.learningProgression,
      performanceGrade: this.getPerformanceGradeFromScore(overallScore),
    };
  }

  /**
   * Get retention metrics
   */
  getRetentionMetrics() {
    const daysSinceFirst = (Date.now() - this.retentionData.firstSession) / (1000 * 60 * 60 * 24);
    const daysSinceLast = (Date.now() - this.retentionData.lastSession) / (1000 * 60 * 60 * 24);

    return {
      daysSinceFirstPlay: Math.floor(daysSinceFirst),
      daysSinceLastPlay: Math.floor(daysSinceLast),
      totalSessions: this.playerMetrics.totalSessions,
      engagementScore: this.retentionData.engagementScore,
      churnRisk: this.retentionData.churnRisk,
      returningPlayer: this.retentionData.returningPlayer,
      weeklyRetention: this.calculateWeeklyRetention(),
    };
  }

  /**
   * Generate actionable insights
   */
  generateInsights() {
    const insights = [];
    const performance = this.getPlayerPerformance();
    const retention = this.getRetentionMetrics();

    // Performance insights
    if (performance.averageApproval < 40) {
      insights.push({
        type: 'improvement',
        title: 'Approval Rating Challenge',
        message: 'Consider focusing on popular policies and crisis management to improve public approval.',
        priority: 'high',
      });
    }

    if (performance.sessionLength < 15) {
      insights.push({
        type: 'engagement',
        title: 'Short Sessions Detected',
        message: 'Try exploring different game features to increase engagement.',
        priority: 'medium',
      });
    }

    // Retention insights
    if (retention.churnRisk === 'high') {
      insights.push({
        type: 'retention',
        title: 'Churn Risk Alert',
        message: 'Consider trying tutorial mode or easier difficulty to improve experience.',
        priority: 'high',
      });
    }

    // Feature usage insights
    const mostUsedFeature = Object.keys(this.playerMetrics.featureUsage)
      .reduce((a, b) => (this.playerMetrics.featureUsage[a] > this.playerMetrics.featureUsage[b] ? a : b), 'dashboard');

    if (mostUsedFeature) {
      insights.push({
        type: 'strength',
        title: 'Feature Mastery',
        message: `You're excelling at using the ${mostUsedFeature} feature!`,
        priority: 'low',
      });
    }

    return insights;
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    // Track game events
    eventSystem.on(EVENTS.TURN_END, (_event) => {
      this.sessionData.turnsPlayed += 1;
    });

    eventSystem.on(EVENTS.APPROVAL_CHANGE, (event) => {
      this.trackApprovalChange(
        event.data.oldApproval,
        event.data.newApproval,
        event.data.reason,
      );
    });

    eventSystem.on(EVENTS.POLICY_PROPOSED, (event) => {
      this.trackPolicy(event.data);
    });

    eventSystem.on('ui:decision_dialog', (event) => {
      this.trackDecision(event.data.decision);
    });

    eventSystem.on('game:end', (event) => {
      this.sessionData.gameEnded = true;
      this.sessionData.endCondition = event.data.endCondition;
      this.playerMetrics.gamesCompleted += 1;
    });

    // Track navigation usage
    eventSystem.on('ui:navigation', (event) => {
      this.trackFeatureUsage(event.data.screen);
    });

    // Performance tracking
    eventSystem.on('performance:metrics', (event) => {
      this.trackPerformance(event.data);
    });
  }

  /**
   * Private helper methods
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackSessionStart() {
    this.playerMetrics.totalSessions += 1;
    this.retentionData.lastSession = Date.now();

    if (this.playerMetrics.totalSessions > 1) {
      this.retentionData.returningPlayer = true;
    }
  }

  trackActivity() {
    // Update session duration and engagement
    this.sessionData.duration = Date.now() - this.sessionData.startTime;

    // Calculate engagement score based on activity
    const activityScore = Math.min(100, this.sessionData.decisions.length * 5 + this.sessionData.turnsPlayed * 2);
    this.retentionData.engagementScore = activityScore;
  }

  updateRetentionMetrics() {
    const daysSinceLast = (Date.now() - this.retentionData.lastSession) / (1000 * 60 * 60 * 24);

    if (daysSinceLast > 7) {
      this.retentionData.churnRisk = 'high';
    } else if (daysSinceLast > 3) {
      this.retentionData.churnRisk = 'medium';
    } else {
      this.retentionData.churnRisk = 'low';
    }
  }

  updatePlayerMetrics() {
    const sessionMinutes = this.sessionData.duration / (1000 * 60);
    this.playerMetrics.totalPlaytime += sessionMinutes;
    this.playerMetrics.averageSessionLength = this.playerMetrics.totalPlaytime / this.playerMetrics.totalSessions;

    // Update learning progression based on performance improvement
    this.updateLearningProgression();
  }

  updateLearningProgression() {
    // Simple learning progression based on recent approval trends
    const recentApprovals = this.playerMetrics.averageApproval.slice(-10);
    if (recentApprovals.length >= 5) {
      const early = recentApprovals.slice(0, recentApprovals.length / 2);
      const recent = recentApprovals.slice(recentApprovals.length / 2);

      const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

      this.playerMetrics.learningProgression = Math.max(0, Math.min(100, (recentAvg - earlyAvg) + 50));
    }
  }

  calculateOverallScore() {
    const avgApproval = this.playerMetrics.averageApproval.length > 0
      ? this.playerMetrics.averageApproval.reduce((a, b) => a + b, 0) / this.playerMetrics.averageApproval.length
      : 0;

    const completionRate = this.playerMetrics.gamesCompleted
      / Math.max(1, this.playerMetrics.gamesCompleted + this.playerMetrics.gamesAbandoned);

    return Math.round((
      avgApproval * 0.3
      + this.playerMetrics.crisisManagementScore * 0.2
      + this.playerMetrics.learningProgression * 0.2
      + (completionRate * 100) * 0.3
    ));
  }

  getPerformanceGrade() {
    const score = this.calculateOverallScore();
    return this.getPerformanceGradeFromScore(score);
  }

  getPerformanceGradeFromScore(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  calculateWeeklyRetention() {
    const weeksSinceFirst = (Date.now() - this.retentionData.firstSession) / (1000 * 60 * 60 * 24 * 7);
    return Math.max(0, Math.min(100, (this.playerMetrics.totalSessions / Math.max(1, weeksSinceFirst)) * 100));
  }

  updatePerformanceScore() {
    let score = 100;

    // Deduct points for poor performance
    const avgLoadTime = this.performanceData.loadTimes.slice(-10).reduce((sum, item) => sum + item.value, 0) / 10;
    if (avgLoadTime > 3000) score -= 20; // > 3 seconds

    const avgMemory = this.performanceData.memoryUsage.slice(-10).reduce((sum, item) => sum + item.value, 0) / 10;
    if (avgMemory > 100) score -= 15; // > 100MB

    const avgFPS = this.performanceData.fps.slice(-10).reduce((sum, item) => sum + item.value, 0) / 10;
    if (avgFPS < 30) score -= 25; // < 30 FPS

    this.performanceData.performanceScore = Math.max(0, score);
  }

  saveAnalytics() {
    try {
      localStorage.setItem('sp_sim_player_metrics', JSON.stringify(this.playerMetrics));
      localStorage.setItem('sp_sim_retention_data', JSON.stringify(this.retentionData));
      localStorage.setItem('sp_sim_performance_data', JSON.stringify(this.performanceData));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  clearAnalytics() {
    localStorage.removeItem('sp_sim_player_metrics');
    localStorage.removeItem('sp_sim_retention_data');
    localStorage.removeItem('sp_sim_performance_data');

    this.playerMetrics = this.loadPlayerMetrics();
    this.retentionData = this.loadRetentionData();
    this.performanceData = this.loadPerformanceData();
  }
}

// Create and export global analytics instance
export const playerAnalytics = new PlayerAnalytics();

// Handle page visibility changes to track session end
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    playerAnalytics.endSession();
  } else {
    playerAnalytics.startSessionTracking();
  }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  playerAnalytics.endSession();
});
