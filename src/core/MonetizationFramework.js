import { eventSystem } from './EventSystem';

/**
 * MonetizationFramework - Manages premium features, licensing, and monetization
 * Designed for educational institutions, premium content, and advanced features
 */
class MonetizationFramework {
  constructor() {
    this.initialized = false;
    this.subscriptionTier = 'free'; // free, premium, educational, enterprise
    this.premiumFeatures = new Set();
    this.usageMetrics = {
      sessionsCount: 0,
      totalPlayTime: 0,
      featuresUsed: new Set(),
      scenariosCompleted: 0,
      achievementsUnlocked: 0,
    };
    this.trials = {
      premiumTrialUsed: false,
      educationalTrialActive: false,
      trialStartDate: null,
      trialEndDate: null,
    };
    this.licenseInfo = {
      type: 'individual',
      institution: null,
      validUntil: null,
      features: [],
    };

    this.setupEventListeners();
    this.loadFromStorage();
  }

  /**
   * Initialize the monetization framework
   */
  initialize() {
    if (this.initialized) return;

    console.log('🏪 Initializing Monetization Framework');

    // Load user's subscription status
    this.loadSubscriptionStatus();

    // Initialize premium features based on tier
    this.initializePremiumFeatures();

    // Start usage tracking
    this.startUsageTracking();

    this.initialized = true;
    console.log(`✅ Monetization Framework initialized - Tier: ${this.subscriptionTier}`);
  }

  /**
   * Load subscription status from storage or server
   */
  loadSubscriptionStatus() {
    const stored = localStorage.getItem('sp_sim_subscription');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.subscriptionTier = data.tier || 'free';
        this.licenseInfo = { ...this.licenseInfo, ...data.license };
        this.trials = { ...this.trials, ...data.trials };
      } catch (error) {
        console.warn('Failed to load subscription data:', error);
      }
    }
  }

  /**
   * Save subscription status to storage
   */
  saveSubscriptionStatus() {
    const data = {
      tier: this.subscriptionTier,
      license: this.licenseInfo,
      trials: this.trials,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('sp_sim_subscription', JSON.stringify(data));
  }

  /**
   * Initialize premium features based on subscription tier
   */
  initializePremiumFeatures() {
    this.premiumFeatures.clear();

    switch (this.subscriptionTier) {
      case 'premium':
        this.premiumFeatures.add('advanced_analytics');
        this.premiumFeatures.add('scenario_editor');
        this.premiumFeatures.add('export_data');
        this.premiumFeatures.add('unlimited_saves');
        this.premiumFeatures.add('premium_scenarios');
        break;

      case 'educational':
        this.premiumFeatures.add('classroom_mode');
        this.premiumFeatures.add('student_progress_tracking');
        this.premiumFeatures.add('curriculum_alignment');
        this.premiumFeatures.add('assessment_tools');
        this.premiumFeatures.add('bulk_licensing');
        this.premiumFeatures.add('advanced_analytics');
        this.premiumFeatures.add('export_data');
        break;

      case 'enterprise':
        this.premiumFeatures.add('custom_scenarios');
        this.premiumFeatures.add('branding_customization');
        this.premiumFeatures.add('api_access');
        this.premiumFeatures.add('priority_support');
        this.premiumFeatures.add('advanced_reporting');
        this.premiumFeatures.add('sso_integration');
        this.premiumFeatures.add('unlimited_everything');
        break;

      default: // free
        // Free tier gets basic features only
        break;
    }

    // Always available for all tiers
    this.premiumFeatures.add('basic_gameplay');
    this.premiumFeatures.add('basic_scenarios');
    this.premiumFeatures.add('basic_saves');
  }

  /**
   * Check if a feature is available for current tier
   */
  hasFeature(featureName) {
    return this.premiumFeatures.has(featureName);
  }

  /**
   * Attempt to use a premium feature
   */
  useFeature(featureName, context = {}) {
    if (this.hasFeature(featureName)) {
      this.trackFeatureUsage(featureName, context);
      return { allowed: true };
    }

    // Feature not available - show upgrade prompt
    return {
      allowed: false,
      reason: 'premium_required',
      feature: featureName,
      upgradePrompt: this.getUpgradePrompt(featureName),
    };
  }

  /**
   * Get upgrade prompt for a specific feature
   */
  getUpgradePrompt(featureName) {
    const prompts = {
      advanced_analytics: {
        title: 'Advanced Analytics - Premium Feature',
        description: 'Get detailed insights into your political performance with advanced charts, trend analysis, and comparative metrics.',
        benefits: ['Detailed performance metrics', 'Historical trend analysis', 'Policy effectiveness tracking', 'Comparative benchmarks'],
      },
      scenario_editor: {
        title: 'Scenario Editor - Premium Feature',
        description: 'Create and share your own political scenarios and challenges.',
        benefits: ['Custom scenario creation', 'Share with community', 'Import/export scenarios', 'Advanced event scripting'],
      },
      classroom_mode: {
        title: 'Classroom Mode - Educational License',
        description: 'Perfect for educators teaching political science, economics, and civics.',
        benefits: ['Student progress tracking', 'Curriculum alignment', 'Assessment tools', 'Classroom management'],
      },
      unlimited_saves: {
        title: 'Unlimited Saves - Premium Feature',
        description: 'Save unlimited game states and create multiple political careers.',
        benefits: ['Unlimited save slots', 'Cloud sync', 'Save organization', 'Backup & restore'],
      },
    };

    return prompts[featureName] || {
      title: 'Premium Feature',
      description: 'This feature requires a premium subscription.',
      benefits: ['Enhanced gameplay', 'Advanced features', 'Priority support'],
    };
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, context = {}) {
    this.usageMetrics.featuresUsed.add(featureName);

    eventSystem.emit('monetization:feature_used', {
      feature: featureName,
      tier: this.subscriptionTier,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start usage tracking
   */
  startUsageTracking() {
    // Track session start
    this.usageMetrics.sessionsCount += 1;
    this.sessionStartTime = Date.now();

    // Save metrics periodically
    this.usageTrackingInterval = setInterval(() => {
      this.saveUsageMetrics();
    }, 30000); // Save every 30 seconds
  }

  /**
   * Save usage metrics
   */
  saveUsageMetrics() {
    if (this.sessionStartTime) {
      this.usageMetrics.totalPlayTime += (Date.now() - this.sessionStartTime);
      this.sessionStartTime = Date.now();
    }

    const data = {
      ...this.usageMetrics,
      featuresUsed: Array.from(this.usageMetrics.featuresUsed),
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem('sp_sim_usage_metrics', JSON.stringify(data));
  }

  /**
   * Load usage metrics from storage
   */
  loadFromStorage() {
    const stored = localStorage.getItem('sp_sim_usage_metrics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.usageMetrics = {
          ...this.usageMetrics,
          ...data,
          featuresUsed: new Set(data.featuresUsed || []),
        };
      } catch (error) {
        console.warn('Failed to load usage metrics:', error);
      }
    }
  }

  /**
   * Check save limit for current tier
   */
  checkSaveLimit(currentSaveCount) {
    const limits = {
      free: 3,
      premium: Infinity,
      educational: Infinity,
      enterprise: Infinity,
    };

    const limit = limits[this.subscriptionTier] || limits.free;
    return {
      allowed: currentSaveCount < limit,
      limit,
      current: currentSaveCount,
    };
  }

  /**
   * Get tier-specific scenario limits
   */
  getScenarioLimits() {
    const limits = {
      free: {
        basic: Infinity,
        premium: 0,
        custom: 0,
        historical: 3,
      },
      premium: {
        basic: Infinity,
        premium: Infinity,
        custom: 10,
        historical: Infinity,
      },
      educational: {
        basic: Infinity,
        premium: Infinity,
        custom: Infinity,
        historical: Infinity,
        curriculum: Infinity,
      },
      enterprise: {
        basic: Infinity,
        premium: Infinity,
        custom: Infinity,
        historical: Infinity,
        branded: Infinity,
      },
    };

    return limits[this.subscriptionTier] || limits.free;
  }

  /**
   * Start trial for premium features
   */
  startTrial(trialType = 'premium') {
    if (this.trials.premiumTrialUsed && trialType === 'premium') {
      return { success: false, reason: 'trial_already_used' };
    }

    const trialDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.trials.trialStartDate = new Date().toISOString();
    this.trials.trialEndDate = new Date(Date.now() + trialDuration).toISOString();

    if (trialType === 'premium') {
      this.trials.premiumTrialUsed = true;
      this.subscriptionTier = 'premium';
    }

    this.initializePremiumFeatures();
    this.saveSubscriptionStatus();

    eventSystem.emit('monetization:trial_started', {
      type: trialType,
      endDate: this.trials.trialEndDate,
    });

    return { success: true, endDate: this.trials.trialEndDate };
  }

  /**
   * Check if trial is active
   */
  isTrialActive() {
    if (!this.trials.trialEndDate) return false;
    return new Date() < new Date(this.trials.trialEndDate);
  }

  /**
   * Upgrade subscription tier
   */
  upgrade(newTier, licenseData = {}) {
    this.subscriptionTier = newTier;
    this.licenseInfo = { ...this.licenseInfo, ...licenseData };
    this.initializePremiumFeatures();
    this.saveSubscriptionStatus();

    eventSystem.emit('monetization:upgraded', {
      newTier,
      previousTier: this.subscriptionTier,
      features: Array.from(this.premiumFeatures),
    });

    console.log(`🎉 Upgraded to ${newTier} tier`);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Game events that affect monetization
    eventSystem.on('game:scenario_completed', (event) => {
      this.usageMetrics.scenariosCompleted += 1;
      this.trackFeatureUsage('scenario_completion', event.data);
    });

    eventSystem.on('achievement:unlocked', (event) => {
      this.usageMetrics.achievementsUnlocked += 1;
      this.trackFeatureUsage('achievement_unlock', event.data);
    });

    // Handle save attempts
    eventSystem.on('game:save_attempt', (event) => {
      const saveCheck = this.checkSaveLimit(event.data.currentSaveCount);
      if (!saveCheck.allowed) {
        eventSystem.emit('monetization:save_limit_reached', {
          limit: saveCheck.limit,
          current: saveCheck.current,
        });
      }
    });

    // Clean up on window close
    window.addEventListener('beforeunload', () => {
      this.saveUsageMetrics();
      if (this.usageTrackingInterval) {
        clearInterval(this.usageTrackingInterval);
      }
    });
  }

  /**
   * Get monetization dashboard data
   */
  getDashboardData() {
    return {
      tier: this.subscriptionTier,
      features: Array.from(this.premiumFeatures),
      usage: {
        ...this.usageMetrics,
        featuresUsed: Array.from(this.usageMetrics.featuresUsed),
      },
      trial: {
        active: this.isTrialActive(),
        endDate: this.trials.trialEndDate,
      },
      license: this.licenseInfo,
    };
  }

  /**
   * Generate revenue analytics (for business intelligence)
   */
  getRevenueAnalytics() {
    return {
      tier: this.subscriptionTier,
      retention: {
        sessions: this.usageMetrics.sessionsCount,
        totalTime: this.usageMetrics.totalPlayTime,
        averageSession: this.usageMetrics.totalPlayTime / Math.max(1, this.usageMetrics.sessionsCount),
      },
      engagement: {
        uniqueFeatures: this.usageMetrics.featuresUsed.size,
        scenariosCompleted: this.usageMetrics.scenariosCompleted,
        achievements: this.usageMetrics.achievementsUnlocked,
      },
      conversion: {
        trialUsed: this.trials.premiumTrialUsed,
        trialActive: this.isTrialActive(),
        isPaying: this.subscriptionTier !== 'free',
      },
    };
  }
}

// Create singleton instance
export const monetizationFramework = new MonetizationFramework();
export default monetizationFramework;
