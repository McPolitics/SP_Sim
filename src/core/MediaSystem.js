import { eventSystem } from './EventSystem';

/**
 * MediaSystem - Manages media outlets, news cycles, and scandal generation
 * Implements weeks 13-16 of the roadmap: Media & Scandal System features
 */
export class MediaSystem {
  constructor() {
    this.eventSystem = eventSystem;
    this.mediaOutlets = this.initializeMediaOutlets();
    this.activeStories = [];
    this.scandals = [];
    this.publicOpinion = {
      trustInMedia: 70,
      politicalAwareness: 60,
      socialMediaInfluence: 40,
    };
    this.newsCycle = {
      currentWeek: 0,
      trendingTopics: [],
      mediaAttention: 50, // 0-100 scale of how much media is focused on government
    };

    this.setupEventListeners();
  }

  /**
   * Initialize different types of media outlets
   */
  initializeMediaOutlets() {
    return {
      television: [
        {
          id: 'national_news',
          name: 'National News Network',
          type: 'television',
          bias: 'center',
          reach: 85,
          credibility: 80,
          influence: 90,
          specialties: ['politics', 'economics', 'international'],
        },
        {
          id: 'conservative_tv',
          name: 'Conservative Broadcasting',
          type: 'television',
          bias: 'right',
          reach: 70,
          credibility: 65,
          influence: 75,
          specialties: ['politics', 'economics', 'social'],
        },
        {
          id: 'progressive_tv',
          name: 'Progressive Network',
          type: 'television',
          bias: 'left',
          reach: 60,
          credibility: 70,
          influence: 65,
          specialties: ['politics', 'environment', 'social'],
        },
      ],
      print: [
        {
          id: 'national_times',
          name: 'The National Times',
          type: 'print',
          bias: 'center-left',
          reach: 40,
          credibility: 90,
          influence: 70,
          specialties: ['politics', 'investigative', 'international'],
        },
        {
          id: 'business_journal',
          name: 'Business Journal',
          type: 'print',
          bias: 'center-right',
          reach: 30,
          credibility: 85,
          influence: 60,
          specialties: ['economics', 'business', 'politics'],
        },
      ],
      socialMedia: [
        {
          id: 'social_platform',
          name: 'SocialConnect',
          type: 'social_media',
          bias: 'varies',
          reach: 95,
          credibility: 40,
          influence: 80,
          specialties: ['viral', 'opinion', 'breaking_news'],
        },
        {
          id: 'news_aggregator',
          name: 'NewsHub',
          type: 'social_media',
          bias: 'algorithmic',
          reach: 70,
          credibility: 50,
          influence: 60,
          specialties: ['aggregation', 'trending', 'personalized'],
        },
      ],
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on('game:turn_processed', (event) => {
      this.processMediaCycle(event.data.gameState);
    });

    this.eventSystem.on('political:event_resolved', (event) => {
      this.coverPoliticalEvent(event.data);
    });

    this.eventSystem.on('economic:major_change', (event) => {
      this.coverEconomicNews(event.data);
    });

    this.eventSystem.on('media:scandal_triggered', (event) => {
      this.handleScandalCoverage(event.data);
    });

    this.eventSystem.on('media:story_response', (event) => {
      this.handleStoryResponse(event.data);
    });
  }

  /**
   * Process media cycle each turn
   */
  processMediaCycle(gameState) {
    this.newsCycle.currentWeek = gameState.time.week + (gameState.time.year - 1) * 52;

    // Update media attention based on game events
    this.updateMediaAttention(gameState);

    // Process existing stories
    this.updateActiveStories(gameState);

    // Generate new stories
    this.generateNewsStories(gameState);

    // Check for scandal opportunities
    this.checkForScandals(gameState);

    // Update public opinion based on media coverage
    this.updatePublicOpinion(gameState);
  }

  /**
   * Update media attention level
   */
  updateMediaAttention(gameState) {
    let attention = this.newsCycle.mediaAttention;

    // High-profile events increase attention
    if (gameState.politics.approval < 40) attention += 5;
    if (gameState.politics.approval > 70) attention += 3;
    if (this.activeStories.length > 3) attention += 3;
    if (this.scandals.filter((s) => s.status === 'active').length > 0) attention += 10;

    // Natural decay towards baseline (50)
    attention += (50 - attention) * 0.1;

    this.newsCycle.mediaAttention = Math.max(0, Math.min(100, attention));
  }

  /**
   * Update existing active stories
   */
  updateActiveStories(_gameState) {
    this.activeStories.forEach((story) => {
      story.age += 1; // Increment story age
      story.relevance = Math.max(0, story.relevance - 10); // Stories lose relevance over time

      // Check if story should fade from news cycle
      if (story.age > story.maxAge || story.relevance < 10) {
        story.status = 'expired';
      }
    });

    // Remove expired stories
    this.activeStories = this.activeStories.filter((story) => story.status !== 'expired');
  }

  /**
   * Generate new news stories
   */
  generateNewsStories(gameState) {
    const storyProbability = this.calculateStoryProbability(gameState);

    if (Math.random() < storyProbability) {
      const storyType = this.selectStoryType(gameState);
      const story = this.createNewsStory(storyType, gameState);

      if (story) {
        this.publishStory(story, gameState);
      }
    }
  }

  /**
   * Calculate probability of new story generation
   */
  calculateStoryProbability(gameState) {
    let baseProbability = 0.4;

    // Higher probability during high media attention
    baseProbability += (this.newsCycle.mediaAttention / 100) * 0.3;

    // Lower probability if already many active stories
    if (this.activeStories.length > 2) {
      baseProbability -= 0.2;
    }

    // Higher probability during significant events
    if (gameState.politics.approval < 35 || gameState.politics.approval > 75) {
      baseProbability += 0.2;
    }

    return Math.min(0.8, baseProbability);
  }

  /**
   * Select story type based on current events
   */
  selectStoryType(gameState) {
    const weights = {
      political_analysis: 30,
      economic_report: 25,
      policy_critique: 20,
      human_interest: 15,
      investigative: 10,
    };

    // Adjust weights based on game state
    if (gameState.politics.approval < 40) {
      weights.political_analysis += 20;
      weights.investigative += 15;
    }

    if (gameState.economy.gdpGrowth < 1.0) {
      weights.economic_report += 20;
    }

    // Weighted random selection
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    const types = Object.entries(weights);
    let selectedType = 'political_analysis';
    types.find(([type, weight]) => {
      random -= weight;
      if (random <= 0) {
        selectedType = type;
        return true;
      }
      return false;
    });

    return selectedType;
  }

  /**
   * Create a news story
   */
  createNewsStory(storyType, gameState) {
    const storyTemplates = this.getStoryTemplates();
    const templates = storyTemplates[storyType] || storyTemplates.political_analysis;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const story = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: storyType,
      headline: this.personalizeHeadline(template.headline, gameState),
      content: this.personalizeContent(template.content, gameState),
      tone: this.calculateStoryTone(storyType, gameState),
      impact: template.impact,
      maxAge: template.maxAge || 3,
      age: 0,
      relevance: 100,
      coveredBy: this.selectCoveringOutlets(storyType),
      status: 'active',
      week: gameState.time.week,
      year: gameState.time.year,
    };

    return story;
  }

  /**
   * Get story templates
   */
  getStoryTemplates() {
    return {
      political_analysis: [
        {
          headline: 'Government Approval Rating Analysis: What the Numbers Mean',
          content: 'Political analysts examine the latest polling data and its implications for upcoming policy decisions.',
          impact: { approval: [-3, 2], mediaAttention: 5 },
          maxAge: 2,
        },
        {
          headline: 'Coalition Dynamics Under Scrutiny',
          content: 'Experts weigh in on the stability of the current governing coalition and potential challenges ahead.',
          impact: { approval: [-2, 1], coalitionStability: [-5, 2] },
          maxAge: 3,
        },
      ],
      economic_report: [
        {
          headline: 'Economic Indicators Show Mixed Signals',
          content: 'Latest GDP and employment figures reveal a complex economic picture with both opportunities and challenges.',
          impact: { approval: [-1, 3], economicConfidence: [-3, 5] },
          maxAge: 2,
        },
        {
          headline: 'Market Responds to Government Economic Policy',
          content: 'Financial markets and business leaders react to recent government economic initiatives.',
          impact: { approval: [-2, 4], economicConfidence: [-2, 3] },
          maxAge: 3,
        },
      ],
      policy_critique: [
        {
          headline: 'Policy Implementation Under the Microscope',
          content: 'Critics and supporters debate the effectiveness of recent government policy changes.',
          impact: { approval: [-5, 3], politicalPressure: [2, 8] },
          maxAge: 3,
        },
      ],
      human_interest: [
        {
          headline: 'Citizens Share Their Views on Government Performance',
          content: 'Ordinary citizens discuss how government policies are affecting their daily lives.',
          impact: { approval: [-1, 2], publicEngagement: [1, 3] },
          maxAge: 1,
        },
      ],
      investigative: [
        {
          headline: 'Investigation Reveals Government Decision-Making Process',
          content: 'In-depth investigation into how key government decisions are made behind closed doors.',
          impact: { approval: [-8, -2], transparency: [-5, 0], mediaAttention: 10 },
          maxAge: 4,
        },
      ],
    };
  }

  /**
   * Personalize headline based on game state
   */
  personalizeHeadline(template, gameState) {
    // Replace placeholders with actual game data
    return template
      .replace('{approval}', `${gameState.politics.approval.toFixed(1)}%`)
      .replace('{gdp}', `${gameState.economy.gdpGrowth.toFixed(1)}%`)
      .replace('{week}', `Week ${gameState.time.week}`)
      .replace('{year}', `Year ${gameState.time.year}`);
  }

  /**
   * Personalize content based on game state
   */
  personalizeContent(template, gameState) {
    return template
      .replace('{approval}', `${gameState.politics.approval.toFixed(1)}%`)
      .replace('{gdp}', `${gameState.economy.gdpGrowth.toFixed(1)}%`);
  }

  /**
   * Calculate story tone based on type and game state
   */
  calculateStoryTone(storyType, gameState) {
    let tone = 'neutral';

    if (storyType === 'investigative') {
      tone = gameState.politics.approval > 60 ? 'critical' : 'exposing';
    } else if (storyType === 'political_analysis') {
      tone = gameState.politics.approval > 60 ? 'positive' : 'critical';
    } else if (storyType === 'economic_report') {
      tone = gameState.economy.gdpGrowth > 2 ? 'positive' : 'concerned';
    }

    return tone;
  }

  /**
   * Select which outlets will cover the story
   */
  selectCoveringOutlets(storyType) {
    const allOutlets = [
      ...this.mediaOutlets.television,
      ...this.mediaOutlets.print,
      ...this.mediaOutlets.socialMedia,
    ];

    return allOutlets.filter((outlet) => {
      // Check if outlet specializes in this story type
      const hasSpecialty = outlet.specialties.some((specialty) => this.storyMatchesSpecialty(storyType, specialty));

      // Random factor + specialty matching
      return hasSpecialty || Math.random() < 0.4;
    });
  }

  /**
   * Check if story type matches outlet specialty
   */
  storyMatchesSpecialty(storyType, specialty) {
    const matches = {
      political_analysis: ['politics', 'opinion'],
      economic_report: ['economics', 'business'],
      policy_critique: ['politics', 'investigative'],
      human_interest: ['social', 'opinion'],
      investigative: ['investigative', 'politics'],
    };

    return matches[storyType]?.includes(specialty) || false;
  }

  /**
   * Publish a story and trigger effects
   */
  publishStory(story, gameState) {
    this.activeStories.push(story);

    // Apply immediate story effects
    this.applyStoryEffects(story, gameState);

    // Emit story publication event
    this.eventSystem.emit('media:story_published', {
      story,
      gameState,
      outlets: story.coveredBy,
    });

    // Add to recent events
    this.eventSystem.emit('game:add_event', {
      title: `📰 Media Coverage: ${story.headline}`,
      description: story.content,
      type: 'media',
      severity: this.getStorySeverity(story),
      storyId: story.id,
    });
  }

  /**
   * Apply story effects to game state
   */
  applyStoryEffects(story, gameState) {
    const effects = story.impact;

    // Apply approval changes
    if (effects.approval) {
      const [min, max] = effects.approval;
      const change = min + Math.random() * (max - min);
      const variance = 0.8 + Math.random() * 0.4; // ±20% variance
      const actualChange = change * variance;

      gameState.politics.approval = Math.max(0, Math.min(
        100,
        gameState.politics.approval + actualChange,
      ));
    }

    // Apply media attention changes
    if (effects.mediaAttention) {
      this.newsCycle.mediaAttention = Math.max(0, Math.min(
        100,
        this.newsCycle.mediaAttention + effects.mediaAttention,
      ));
    }
  }

  /**
   * Get story severity for UI display
   */
  getStorySeverity(story) {
    if (story.type === 'investigative') return 'high';
    if (story.type === 'policy_critique') return 'medium';
    return 'low';
  }

  /**
   * Check for potential scandals
   */
  checkForScandals(gameState) {
    const scandalProbability = this.calculateScandalProbability(gameState);

    if (Math.random() < scandalProbability) {
      const scandal = this.generateScandal(gameState);
      if (scandal) {
        this.triggerScandal(scandal, gameState);
      }
    }
  }

  /**
   * Calculate scandal probability
   */
  calculateScandalProbability(gameState) {
    let baseProbability = 0.05; // 5% base chance per turn

    // Higher probability with low approval
    if (gameState.politics.approval < 40) {
      baseProbability += 0.1;
    }

    // Higher probability with high media attention
    baseProbability += (this.newsCycle.mediaAttention / 100) * 0.1;

    // Lower probability if recent scandal
    const recentScandals = this.scandals.filter((s) => s.status === 'active' || (s.resolvedWeek
      && ((gameState.time.week + (gameState.time.year - 1) * 52) - s.resolvedWeek) < 8));

    if (recentScandals.length > 0) {
      baseProbability *= 0.3;
    }

    return Math.min(0.3, baseProbability);
  }

  /**
   * Generate a scandal
   */
  generateScandal(gameState) {
    const scandalTypes = this.getScandalTypes();
    const type = scandalTypes[Math.floor(Math.random() * scandalTypes.length)];

    const scandal = {
      id: `scandal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type.id,
      title: type.title,
      description: type.description,
      severity: type.severity,
      impact: type.impact,
      status: 'brewing',
      discoveryWeek: gameState.time.week + Math.floor(Math.random() * 3) + 1, // 1-3 weeks
      discoveryYear: gameState.time.year,
      mediaAttention: 0,
    };

    return scandal;
  }

  /**
   * Get scandal types
   */
  getScandalTypes() {
    return [
      {
        id: 'policy_leak',
        title: 'Confidential Policy Document Leaked',
        description: 'Sensitive government documents reveal controversial policy discussions',
        severity: 'medium',
        impact: { approval: [-8, -3], transparency: [-10, -5], mediaAttention: 15 },
      },
      {
        id: 'expense_irregularity',
        title: 'Government Expense Irregularities',
        description: 'Questions raised about government spending on official events',
        severity: 'low',
        impact: { approval: [-5, -2], trustInGovernment: [-5, -2], mediaAttention: 10 },
      },
      {
        id: 'appointment_controversy',
        title: 'Controversial Political Appointment',
        description: 'Opposition questions qualifications of recent high-profile appointment',
        severity: 'medium',
        impact: { approval: [-6, -2], coalitionStability: [-8, -3], mediaAttention: 12 },
      },
      {
        id: 'meeting_scandal',
        title: 'Undisclosed Private Meeting',
        description: 'Reports emerge of undisclosed meetings with controversial figures',
        severity: 'high',
        impact: { approval: [-12, -6], transparency: [-15, -8], mediaAttention: 20 },
      },
    ];
  }

  /**
   * Trigger a scandal
   */
  triggerScandal(scandal, gameState) {
    scandal.status = 'active';
    this.scandals.push(scandal);

    // Immediate media coverage
    this.newsCycle.mediaAttention = Math.min(
      100,
      this.newsCycle.mediaAttention + scandal.impact.mediaAttention,
    );

    // Create scandal story
    const scandalStory = {
      id: `scandal_story_${scandal.id}`,
      type: 'scandal_breaking',
      headline: `🚨 BREAKING: ${scandal.title}`,
      content: scandal.description,
      tone: 'breaking',
      impact: scandal.impact,
      maxAge: 5,
      age: 0,
      relevance: 100,
      coveredBy: this.getAllMajorOutlets(),
      status: 'active',
      scandalId: scandal.id,
      week: gameState.time.week,
      year: gameState.time.year,
    };

    this.publishStory(scandalStory, gameState);

    // Emit scandal event
    this.eventSystem.emit('media:scandal_triggered', {
      scandal,
      story: scandalStory,
      gameState,
    });
  }

  /**
   * Get all major outlets for scandal coverage
   */
  getAllMajorOutlets() {
    return [
      ...this.mediaOutlets.television,
      ...this.mediaOutlets.print.filter((outlet) => outlet.reach > 35),
      ...this.mediaOutlets.socialMedia,
    ];
  }

  /**
   * Handle scandal coverage response
   */
  handleScandalCoverage(data) {
    const { scandal } = data;

    // Show scandal management modal
    this.showScandalResponseModal(scandal, data.gameState);
  }

  /**
   * Show scandal response modal
   */
  showScandalResponseModal(scandal, gameState) {
    this.eventSystem.emit('ui:show_modal', {
      title: `🚨 Scandal Alert: ${scandal.title}`,
      content: `
        <div class="scandal-response-modal">
          <div class="scandal-alert">
            <div class="alert-icon">⚠️</div>
            <p><strong>Scandal Detected!</strong> The media has uncovered a potential scandal.</p>
          </div>
          
          <div class="scandal-details">
            <h4>Situation:</h4>
            <p>${scandal.description}</p>
          </div>

          <div class="scandal-impact">
            <h4>Potential Impact:</h4>
            <ul>
              <li>📊 Approval rating could decline significantly</li>
              <li>📺 Media attention will intensify</li>
              <li>🏛️ Coalition stability may be affected</li>
              <li>🗳️ Opposition may capitalize on this issue</li>
            </ul>
          </div>

          <div class="response-options">
            <h4>Response Strategy:</h4>
            <div class="options-grid">
              <button class="response-option" data-response="deny">
                <strong>📢 Deny & Deflect</strong>
                <span>Strongly deny allegations and redirect attention</span>
              </button>
              <button class="response-option" data-response="investigate">
                <strong>🔍 Launch Investigation</strong>
                <span>Announce internal investigation to find facts</span>
              </button>
              <button class="response-option" data-response="acknowledge">
                <strong>✋ Acknowledge & Reform</strong>
                <span>Accept responsibility and announce reforms</span>
              </button>
              <button class="response-option" data-response="ignore">
                <strong>🤐 No Comment</strong>
                <span>Refuse to comment and weather the storm</span>
              </button>
            </div>
          </div>
        </div>

        <style>
          .scandal-response-modal {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .scandal-alert {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            color: #dc2626;
          }
          
          .alert-icon {
            font-size: 2rem;
          }
          
          .scandal-details,
          .scandal-impact {
            margin-bottom: var(--spacing-lg);
          }
          
          .scandal-details h4,
          .scandal-impact h4,
          .response-options h4 {
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }
          
          .scandal-impact ul {
            list-style: none;
            padding: 0;
          }
          
          .scandal-impact li {
            padding: var(--spacing-xs) 0;
          }
          
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md);
          }
          
          .response-option {
            padding: var(--spacing-md);
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius);
            background: var(--surface-color);
            cursor: pointer;
            transition: all var(--transition-base);
            text-align: left;
          }
          
          .response-option:hover {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.05);
          }
          
          .response-option.selected {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.1);
          }
          
          .response-option strong {
            display: block;
            margin-bottom: var(--spacing-xs);
            color: var(--text-color);
          }
          
          .response-option span {
            color: var(--text-light);
            font-size: 0.875rem;
          }
          
          @media (max-width: 768px) {
            .options-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      `,
      confirmText: 'Respond to Scandal',
      cancelText: 'Delay Response',
      showCancel: true,
      onConfirm: () => {
        const selectedOption = document.querySelector('.response-option.selected');
        if (!selectedOption) {
          return false; // Keep modal open
        }

        const response = selectedOption.getAttribute('data-response');
        this.handleScandalResponse(scandal.id, response, gameState);
        return true;
      },
    });

    // Add option selection handlers
    setTimeout(() => {
      const options = document.querySelectorAll('.response-option');
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
    }, 100);
  }

  /**
   * Handle scandal response
   */
  handleScandalResponse(scandalId, response, gameState) {
    const scandal = this.scandals.find((s) => s.id === scandalId);
    if (!scandal) return;

    const responseEffects = this.getScandalResponseEffects(response, scandal);

    // Apply effects to game state
    this.applyScandalResponseEffects(responseEffects, gameState);

    // Update scandal status
    scandal.response = response;
    scandal.responseWeek = gameState.time.week;
    scandal.responseYear = gameState.time.year;

    // Create follow-up story
    const followUpStory = this.createScandalFollowUpStory(scandal, response, gameState);
    this.publishStory(followUpStory, gameState);

    // Emit scandal response event
    this.eventSystem.emit('media:scandal_response', {
      scandal,
      response,
      effects: responseEffects,
      gameState,
    });
  }

  /**
   * Get scandal response effects
   */
  getScandalResponseEffects(response, scandal) {
    const baseEffects = {
      deny: { approval: [-3, 1], transparency: [-5, -2], mediaAttention: 5 },
      investigate: { approval: [-1, 2], transparency: [2, 5], mediaAttention: -3 },
      acknowledge: { approval: [-2, 3], transparency: [5, 8], mediaAttention: -5 },
      ignore: { approval: [-5, -1], transparency: [-3, 0], mediaAttention: 8 },
    };

    const effects = baseEffects[response] || baseEffects.ignore;

    // Scale effects based on scandal severity
    let severityMultiplier;
    if (scandal.severity === 'high') {
      severityMultiplier = 1.5;
    } else if (scandal.severity === 'medium') {
      severityMultiplier = 1.0;
    } else {
      severityMultiplier = 0.7;
    }

    const scaledEffects = {};
    Object.keys(effects).forEach((key) => {
      if (Array.isArray(effects[key])) {
        scaledEffects[key] = effects[key].map((val) => val * severityMultiplier);
      } else {
        scaledEffects[key] = effects[key] * severityMultiplier;
      }
    });

    return scaledEffects;
  }

  /**
   * Apply scandal response effects
   */
  applyScandalResponseEffects(effects, gameState) {
    // Apply approval changes
    if (effects.approval) {
      const [min, max] = effects.approval;
      const change = min + Math.random() * (max - min);
      gameState.politics.approval = Math.max(0, Math.min(
        100,
        gameState.politics.approval + change,
      ));
    }

    // Apply media attention changes
    if (effects.mediaAttention) {
      this.newsCycle.mediaAttention = Math.max(0, Math.min(
        100,
        this.newsCycle.mediaAttention + effects.mediaAttention,
      ));
    }
  }

  /**
   * Create scandal follow-up story
   */
  createScandalFollowUpStory(scandal, response, gameState) {
    const responseTexts = {
      deny: 'Government Denies Scandal Allegations',
      investigate: 'Investigation Launched into Scandal Claims',
      acknowledge: 'Government Acknowledges Issues, Promises Reform',
      ignore: 'Government Remains Silent on Scandal',
    };

    return {
      id: `scandal_followup_${scandal.id}`,
      type: 'scandal_followup',
      headline: `📰 ${responseTexts[response]}`,
      content: `Government responds to recent scandal with ${response} strategy. Public and opposition react to the handling of the situation.`,
      tone: response === 'acknowledge' ? 'measured' : 'ongoing',
      impact: { mediaAttention: -2 },
      maxAge: 3,
      age: 0,
      relevance: 80,
      coveredBy: this.getAllMajorOutlets(),
      status: 'active',
      scandalId: scandal.id,
      week: gameState.time.week,
      year: gameState.time.year,
    };
  }

  /**
   * Update public opinion based on media coverage
   */
  updatePublicOpinion(_gameState) {
    // Update trust in media based on story accuracy and credibility
    this.publicOpinion.trustInMedia += (Math.random() - 0.5) * 2;
    this.publicOpinion.trustInMedia = Math.max(0, Math.min(100, this.publicOpinion.trustInMedia));

    // Update political awareness based on media coverage
    if (this.newsCycle.mediaAttention > 70) {
      this.publicOpinion.politicalAwareness += 1;
    }
    this.publicOpinion.politicalAwareness = Math.max(0, Math.min(100, this.publicOpinion.politicalAwareness));

    // Update social media influence
    this.publicOpinion.socialMediaInfluence += (Math.random() - 0.4) * 1;
    this.publicOpinion.socialMediaInfluence = Math.max(0, Math.min(100, this.publicOpinion.socialMediaInfluence));
  }

  /**
   * Calculate overall media influence
   */
  calculateMediaInfluence() {
    const totalReach = this.getAllOutlets().reduce((sum, outlet) => sum + outlet.reach, 0);
    const avgCredibility = this.getAllOutlets().reduce((sum, outlet) => sum + outlet.credibility, 0) / this.getAllOutlets().length;

    return (totalReach / this.getAllOutlets().length) * (avgCredibility / 100);
  }

  /**
   * Get all media outlets
   */
  getAllOutlets() {
    return [
      ...this.mediaOutlets.television,
      ...this.mediaOutlets.print,
      ...this.mediaOutlets.socialMedia,
    ];
  }

  /**
   * Cover political event
   */
  coverPoliticalEvent(eventData) {
    const { event, option, effects } = eventData;

    // Create news coverage of political event
    const coverageStory = {
      id: `political_coverage_${event.id}`,
      type: 'political_coverage',
      headline: `📊 Government ${option.text} on ${event.title}`,
      content: `The government has decided to ${option.description}. ${this.formatEffects(effects)}`,
      tone: effects.approval > 0 ? 'positive' : 'critical',
      impact: { mediaAttention: 3 },
      maxAge: 2,
      age: 0,
      relevance: 70,
      coveredBy: this.selectCoveringOutlets('political_analysis'),
      status: 'active',
      week: eventData.gameState.time.week,
      year: eventData.gameState.time.year,
    };

    this.publishStory(coverageStory, eventData.gameState);
  }

  /**
   * Format effects for display
   */
  formatEffects(effects) {
    const parts = [];

    if (effects.approval) {
      parts.push(`Approval ${effects.approval > 0 ? '+' : ''}${effects.approval.toFixed(1)}%`);
    }

    if (effects.gdp) {
      parts.push(`GDP ${effects.gdp > 0 ? '+' : ''}${effects.gdp.toFixed(1)}%`);
    }

    return parts.length > 0 ? `Impact: ${parts.join(', ')}` : '';
  }

  /**
   * Get active media stories
   */
  getActiveStories() {
    return this.activeStories.slice(); // Return copy
  }

  /**
   * Get active scandals
   */
  getActiveScandals() {
    return this.scandals.filter((scandal) => scandal.status === 'active');
  }

  /**
   * Get media status summary
   */
  getMediaStatus() {
    return {
      mediaAttention: this.newsCycle.mediaAttention,
      activeStories: this.activeStories.length,
      activeScandals: this.getActiveScandals().length,
      publicOpinion: { ...this.publicOpinion },
      trendingTopics: this.newsCycle.trendingTopics.slice(),
    };
  }
}

// Create and export singleton instance
export const mediaSystem = new MediaSystem();
