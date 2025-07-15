import { BaseComponent } from './BaseComponent';
import { Modal } from './Modal';
import { monetizationFramework } from '../../core/MonetizationFramework';
import { eventSystem } from '../../core/EventSystem';

/**
 * MonetizationModal - Handles upgrade prompts and premium feature promotions
 * Shows when users try to access premium features
 */
export class MonetizationModal extends BaseComponent {
  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for monetization events
   */
  setupEventListeners() {
    // Listen for feature access attempts
    eventSystem.on('monetization:feature_blocked', (event) => {
      this.showUpgradeModal(event.data);
    });

    // Listen for save limit reached
    eventSystem.on('monetization:save_limit_reached', (event) => {
      this.showSaveLimitModal(event.data);
    });

    // Listen for policy rejection due to monetization
    eventSystem.on('policy:rejected', (event) => {
      if (event.data.reason === 'monetization_limit' && event.data.upgradePrompt) {
        this.showPolicyUpgradeModal(event.data);
      }
    });
  }

  /**
   * Show upgrade modal for blocked features
   */
  showUpgradeModal(data) {
    const { feature, upgradePrompt } = data;

    const modal = new Modal({
      title: upgradePrompt.title || `Premium Feature: ${feature}`,
      content: this.renderUpgradeContent(upgradePrompt),
      confirmText: 'Upgrade Now',
      cancelText: 'Maybe Later',
      showCancel: true,
      onConfirm: () => {
        this.handleUpgradeAction(feature);
        return true;
      },
    });

    modal.show();
  }

  /**
   * Show save limit modal
   */
  showSaveLimitModal(data) {
    const { limit, current } = data;

    const modal = new Modal({
      title: 'Save Limit Reached',
      content: `
        <div class="save-limit-modal">
          <div class="limit-info">
            <p>You've reached your save limit (${current}/${limit}).</p>
            <p>Upgrade to premium for unlimited saves and cloud sync!</p>
          </div>
          
          <div class="premium-benefits">
            <h4>Premium Benefits:</h4>
            <ul>
              <li>✅ Unlimited saves</li>
              <li>✅ Cloud synchronization</li>
              <li>✅ Save organization</li>
              <li>✅ Backup & restore</li>
              <li>✅ Advanced analytics</li>
              <li>✅ Premium scenarios</li>
            </ul>
          </div>

          <div class="trial-option">
            <p><strong>Try Premium FREE for 7 days!</strong></p>
          </div>
        </div>
      `,
      confirmText: 'Start Free Trial',
      cancelText: 'Continue with Free',
      showCancel: true,
      onConfirm: () => {
        this.startTrial();
        return true;
      },
    });

    modal.show();
  }

  /**
   * Show policy upgrade modal
   */
  showPolicyUpgradeModal(data) {
    const { policy, upgradePrompt } = data;

    const modal = new Modal({
      title: 'Policy Requires Premium',
      content: `
        <div class="policy-upgrade-modal">
          <div class="policy-info">
            <h4>${policy.name}</h4>
            <p>This advanced policy requires a premium subscription.</p>
          </div>
          
          ${this.renderUpgradeContent(upgradePrompt)}
          
          <div class="alternative-suggestion">
            <h4>Free Alternative:</h4>
            <p>Try a similar but simpler policy from the basic templates.</p>
          </div>
        </div>
      `,
      confirmText: 'Upgrade to Premium',
      cancelText: 'Use Basic Policy',
      showCancel: true,
      onConfirm: () => {
        this.handleUpgradeAction('advanced_policies');
        return true;
      },
      onCancel: () => {
        this.suggestAlternativePolicy(policy);
      },
    });

    modal.show();
  }

  /**
   * Render upgrade content
   */
  renderUpgradeContent(upgradePrompt) {
    return `
      <div class="upgrade-content">
        <div class="feature-description">
          <p>${upgradePrompt.description}</p>
        </div>
        
        <div class="benefits-list">
          <h4>What you'll get:</h4>
          <ul>
            ${upgradePrompt.benefits?.map((benefit) => `<li>✅ ${benefit}</li>`).join('') || ''}
          </ul>
        </div>
        
        <div class="pricing-info">
          ${this.renderPricingTiers()}
        </div>
        
        <div class="trial-highlight">
          <p><strong>🎁 Start with a FREE 7-day trial!</strong></p>
          <p><small>Cancel anytime, no commitment required.</small></p>
        </div>
      </div>
      
      <style>
        .upgrade-content {
          max-width: 500px;
          text-align: left;
        }
        
        .feature-description {
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--border-radius);
        }
        
        .benefits-list ul {
          list-style: none;
          padding: 0;
        }
        
        .benefits-list li {
          padding: var(--spacing-xs) 0;
          border-bottom: 1px solid var(--border-light);
        }
        
        .benefits-list li:last-child {
          border-bottom: none;
        }
        
        .pricing-tiers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
          margin: var(--spacing-md) 0;
        }
        
        .pricing-tier {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          text-align: center;
          transition: all var(--transition-base);
        }
        
        .pricing-tier:hover {
          border-color: var(--secondary-color);
          box-shadow: var(--shadow-sm);
        }
        
        .tier-recommended {
          border-color: var(--secondary-color);
          background: rgba(59, 130, 246, 0.05);
          position: relative;
        }
        
        .tier-recommended::before {
          content: "Most Popular";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--secondary-color);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .tier-name {
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
        }
        
        .tier-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--secondary-color);
          margin-bottom: var(--spacing-xs);
        }
        
        .tier-period {
          font-size: 0.9rem;
          color: var(--text-light);
          margin-bottom: var(--spacing-sm);
        }
        
        .tier-features {
          list-style: none;
          padding: 0;
          font-size: 0.9rem;
        }
        
        .tier-features li {
          padding: var(--spacing-xs) 0;
        }
        
        .trial-highlight {
          text-align: center;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          padding: var(--spacing-md);
          border-radius: var(--border-radius);
          margin-top: var(--spacing-md);
        }
        
        .trial-highlight p {
          margin: 0;
        }
        
        .trial-highlight small {
          opacity: 0.9;
        }
        
        @media (max-width: 768px) {
          .pricing-tiers {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }

  /**
   * Render pricing tiers
   */
  renderPricingTiers() {
    return `
      <div class="pricing-tiers">
        <div class="pricing-tier">
          <div class="tier-name">Premium</div>
          <div class="tier-price">$9.99</div>
          <div class="tier-period">per month</div>
          <ul class="tier-features">
            <li>Unlimited saves</li>
            <li>Advanced analytics</li>
            <li>Premium scenarios</li>
            <li>Export data</li>
          </ul>
        </div>
        
        <div class="pricing-tier tier-recommended">
          <div class="tier-name">Educational</div>
          <div class="tier-price">$29.99</div>
          <div class="tier-period">per month</div>
          <ul class="tier-features">
            <li>All Premium features</li>
            <li>Classroom management</li>
            <li>Student tracking</li>
            <li>Curriculum alignment</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Handle upgrade action
   */
  handleUpgradeAction(feature) {
    // Check if trial is available
    if (!monetizationFramework.trials.premiumTrialUsed) {
      this.startTrial();
    } else {
      this.showPurchaseOptions(feature);
    }
  }

  /**
   * Start premium trial
   */
  startTrial() {
    const result = monetizationFramework.startTrial('premium');

    if (result.success) {
      const modal = new Modal({
        title: '🎉 Premium Trial Started!',
        content: `
          <div class="trial-success">
            <p>Welcome to SP_Sim Premium!</p>
            <p>Your 7-day free trial has started. You now have access to:</p>
            <ul>
              <li>✅ Unlimited saves with cloud sync</li>
              <li>✅ Advanced analytics and reporting</li>
              <li>✅ Premium policy scenarios</li>
              <li>✅ Data export capabilities</li>
              <li>✅ Priority customer support</li>
            </ul>
            <p><strong>Trial ends:</strong> ${new Date(result.endDate).toLocaleDateString()}</p>
            <p><small>You can cancel anytime before the trial ends.</small></p>
          </div>
        `,
        confirmText: 'Start Playing!',
        showCancel: false,
      });

      modal.show();

      // Refresh current screen to show new features
      eventSystem.emit('ui:refresh_screen');
    } else {
      this.showTrialError(result.reason);
    }
  }

  /**
   * Show trial error
   */
  showTrialError(reason) {
    let message = 'Unable to start trial. Please try again.';

    if (reason === 'trial_already_used') {
      message = 'You have already used your free trial. Consider upgrading to premium!';
    }

    const modal = new Modal({
      title: 'Trial Not Available',
      content: `<p>${message}</p>`,
      confirmText: 'OK',
      showCancel: false,
    });

    modal.show();
  }

  /**
   * Show purchase options
   */
  showPurchaseOptions(_feature) {
    // In a real app, this would integrate with payment processing
    // For demo purposes, we'll just simulate upgrade
    const modal = new Modal({
      title: 'Upgrade to Premium',
      content: `
        <div class="purchase-options">
          <p>In a real app, this would redirect to payment processing.</p>
          <p>For this demo, you can simulate the upgrade process.</p>
          <div class="demo-notice">
            <p><strong>Demo Mode:</strong> Click "Simulate Upgrade" to test premium features.</p>
          </div>
        </div>
      `,
      confirmText: 'Simulate Upgrade',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        this.simulateUpgrade();
        return true;
      },
    });

    modal.show();
  }

  /**
   * Simulate upgrade for demo
   */
  simulateUpgrade() {
    monetizationFramework.upgrade('premium', {
      type: 'demo',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    });

    const modal = new Modal({
      title: '🎉 Upgrade Successful!',
      content: `
        <div class="upgrade-success">
          <p>Welcome to SP_Sim Premium!</p>
          <p>You now have access to all premium features:</p>
          <ul>
            <li>✅ Unlimited saves and cloud sync</li>
            <li>✅ Advanced analytics dashboard</li>
            <li>✅ Premium policy scenarios</li>
            <li>✅ Data export and sharing</li>
            <li>✅ Priority support</li>
            <li>✅ Scenario editor</li>
          </ul>
          <p><strong>Thank you for supporting SP_Sim!</strong></p>
        </div>
      `,
      confirmText: 'Explore Premium Features',
      showCancel: false,
      onConfirm: () => {
        eventSystem.emit('ui:refresh_screen');
        eventSystem.emit('navigation:goto', { screen: 'analytics' });
        return true;
      },
    });

    modal.show();
  }

  /**
   * Suggest alternative policy
   */
  suggestAlternativePolicy(blockedPolicy) {
    // This could suggest simpler versions of the same policy
    eventSystem.emit('policy:suggest_alternative', {
      originalPolicy: blockedPolicy,
      category: blockedPolicy.category,
    });
  }

  /**
   * Show current subscription status
   */
  showSubscriptionStatus() {
    const data = monetizationFramework.getDashboardData();

    const modal = new Modal({
      title: 'Subscription Status',
      content: `
        <div class="subscription-status">
          <div class="current-tier">
            <h4>Current Plan: ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)}</h4>
          </div>
          
          <div class="features-list">
            <h4>Available Features:</h4>
            <ul>
              ${data.features.map((feature) => `<li>✅ ${feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</li>`).join('')}
            </ul>
          </div>
          
          <div class="usage-stats">
            <h4>Usage Statistics:</h4>
            <ul>
              <li>Sessions: ${data.usage.sessionsCount}</li>
              <li>Features Used: ${data.usage.featuresUsed.length}</li>
              <li>Scenarios Completed: ${data.usage.scenariosCompleted}</li>
              <li>Achievements: ${data.usage.achievementsUnlocked}</li>
            </ul>
          </div>
          
          ${data.trial.active ? `
            <div class="trial-info">
              <h4>🎁 Trial Active</h4>
              <p>Trial ends: ${new Date(data.trial.endDate).toLocaleDateString()}</p>
            </div>
          ` : ''}
        </div>
      `,
      confirmText: data.tier === 'free' ? 'Upgrade Now' : 'Close',
      showCancel: false,
      onConfirm: () => {
        if (data.tier === 'free') {
          this.showUpgradeModal({
            feature: 'premium_upgrade',
            upgradePrompt: {
              title: 'Upgrade to Premium',
              description: 'Unlock all premium features and enhance your political simulation experience.',
              benefits: ['Unlimited saves', 'Advanced analytics', 'Premium scenarios', 'Data export', 'Priority support'],
            },
          });
          return false; // Keep modal open
        }
        return true;
      },
    });

    modal.show();
  }
}

export default MonetizationModal;
