import { BaseComponent } from './BaseComponent';
import { Modal } from './Modal';
import { eventSystem, EVENTS } from '../../core/EventSystem';

/**
 * PlayerGuide - Comprehensive help and tutorial system
 * Provides basic and advanced guides for game mechanics
 */
export class PlayerGuide extends BaseComponent {
  constructor() {
    super();
    this.currentMode = 'basic'; // 'basic' or 'advanced'
    this.currentSection = 'overview';
    this.guideData = this.initializeGuideData();
    this.element = null;
    
    this.createGuideStructure();
  }

  /**
   * Initialize guide data structure
   */
  initializeGuideData() {
    return {
      basic: {
        overview: {
          title: 'Welcome to SP_Sim',
          icon: '🎮',
          content: `
            <div class="guide-welcome">
              <h2>Welcome to SP_Sim! 🏛️</h2>
              <p>You are now the leader of Democracia, a nation of 50 million people. Your decisions will shape the economic, political, and social future of your country.</p>
              
              <div class="key-objectives">
                <h3>Your Main Objectives:</h3>
                <ul>
                  <li><strong>Maintain Public Support:</strong> Keep your approval rating above 30% to stay in power</li>
                  <li><strong>Manage the Economy:</strong> Balance growth, employment, and fiscal responsibility</li>
                  <li><strong>Navigate Politics:</strong> Build coalitions and pass important legislation</li>
                  <li><strong>Handle Crises:</strong> Respond effectively to unexpected events and scandals</li>
                  <li><strong>Prepare for Elections:</strong> Face voters every 4 years to secure your mandate</li>
                </ul>
              </div>

              <div class="getting-started">
                <h3>Getting Started:</h3>
                <p>The game runs in real-time with each turn representing one week. You can pause anytime to make decisions carefully. Start by exploring the different screens and familiarizing yourself with the current state of your nation.</p>
              </div>
            </div>
          `
        },
        controls: {
          title: 'Game Controls & Interface',
          icon: '🎛️',
          content: `
            <div class="guide-controls">
              <h2>Game Controls & Interface</h2>
              
              <div class="control-section">
                <h3>Main Navigation</h3>
                <div class="control-grid">
                  <div class="control-item">
                    <strong>Dashboard:</strong> Overview of all key metrics and current status
                  </div>
                  <div class="control-item">
                    <strong>Economy:</strong> Detailed economic data, charts, and policy tools
                  </div>
                  <div class="control-item">
                    <strong>Politics:</strong> Coalition management, approval ratings, and elections
                  </div>
                  <div class="control-item">
                    <strong>Global Relations:</strong> International diplomacy and trade
                  </div>
                  <div class="control-item">
                    <strong>Policies:</strong> Implement new policies and review active legislation
                  </div>
                  <div class="control-item">
                    <strong>Crisis Management:</strong> Handle scandals, emergencies, and unexpected events
                  </div>
                </div>
              </div>

              <div class="control-section">
                <h3>Game Controls</h3>
                <div class="control-grid">
                  <div class="control-item">
                    <strong>Pause Button:</strong> Stop/resume game time (Spacebar)
                  </div>
                  <div class="control-item">
                    <strong>Next Turn:</strong> Advance one week when paused (N key)
                  </div>
                  <div class="control-item">
                    <strong>Save Game:</strong> Create a save file (Ctrl+S)
                  </div>
                  <div class="control-item">
                    <strong>Load Game:</strong> Load a previous save (Ctrl+L)
                  </div>
                </div>
              </div>

              <div class="control-section">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcut-list">
                  <div class="shortcut-item"><kbd>Space</kbd> - Pause/Resume game</div>
                  <div class="shortcut-item"><kbd>N</kbd> - Next turn (when paused)</div>
                  <div class="shortcut-item"><kbd>Ctrl+S</kbd> - Save game</div>
                  <div class="shortcut-item"><kbd>Ctrl+L</kbd> - Load game dialog</div>
                </div>
              </div>
            </div>
          `
        },
        economy: {
          title: 'Understanding the Economy',
          icon: '💰',
          content: `
            <div class="guide-economy">
              <h2>Understanding the Economy</h2>
              
              <div class="economic-indicators">
                <h3>Key Economic Indicators</h3>
                <div class="indicator-grid">
                  <div class="indicator-item">
                    <h4>GDP Growth</h4>
                    <p>The percentage change in your nation's economic output. Higher is generally better, but rapid growth can cause inflation.</p>
                    <div class="indicator-ranges">
                      <span class="range-good">Good: 2-4%</span>
                      <span class="range-caution">Caution: 4-6% or 0-2%</span>
                      <span class="range-danger">Danger: Negative or >6%</span>
                    </div>
                  </div>
                  
                  <div class="indicator-item">
                    <h4>Unemployment Rate</h4>
                    <p>Percentage of working-age population without jobs. High unemployment hurts approval and economic growth.</p>
                    <div class="indicator-ranges">
                      <span class="range-good">Good: 3-6%</span>
                      <span class="range-caution">Caution: 6-8%</span>
                      <span class="range-danger">Danger: >8%</span>
                    </div>
                  </div>
                  
                  <div class="indicator-item">
                    <h4>Inflation Rate</h4>
                    <p>How fast prices are rising. Some inflation is normal, but too much erodes purchasing power.</p>
                    <div class="indicator-ranges">
                      <span class="range-good">Good: 1-3%</span>
                      <span class="range-caution">Caution: 3-5% or <1%</span>
                      <span class="range-danger">Danger: >5% or negative</span>
                    </div>
                  </div>
                  
                  <div class="indicator-item">
                    <h4>National Debt</h4>
                    <p>Government debt as percentage of GDP. Some debt is normal, but too much limits your options.</p>
                    <div class="indicator-ranges">
                      <span class="range-good">Good: <60%</span>
                      <span class="range-caution">Caution: 60-90%</span>
                      <span class="range-danger">Danger: >90%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="economic-tips">
                <h3>Economic Management Tips</h3>
                <ul>
                  <li><strong>Watch for cycles:</strong> Economies naturally go through boom and bust cycles</li>
                  <li><strong>Counter-cyclical policy:</strong> Stimulate during recessions, cool down during overheating</li>
                  <li><strong>Balance growth and stability:</strong> Fast growth is good, but avoid bubbles</li>
                  <li><strong>Monitor all indicators:</strong> Don't focus on just one metric</li>
                  <li><strong>Plan for the long term:</strong> Short-term gains can have long-term consequences</li>
                </ul>
              </div>
            </div>
          `
        },
        politics: {
          title: 'Political System Basics',
          icon: '🗳️',
          content: `
            <div class="guide-politics">
              <h2>Political System Basics</h2>
              
              <div class="political-overview">
                <h3>How Politics Works in SP_Sim</h3>
                <p>Your political survival depends on maintaining support from various groups and managing complex relationships.</p>
              </div>

              <div class="approval-system">
                <h3>Approval Rating</h3>
                <p>Your approval rating represents public support and is influenced by:</p>
                <ul>
                  <li><strong>Economic Performance:</strong> GDP growth, unemployment, inflation</li>
                  <li><strong>Policy Success:</strong> Whether your policies achieve their goals</li>
                  <li><strong>Crisis Handling:</strong> How well you manage unexpected events</li>
                  <li><strong>Scandals:</strong> Personal and government controversies</li>
                  <li><strong>International Standing:</strong> Success in foreign policy</li>
                </ul>
                
                <div class="approval-ranges">
                  <div class="approval-range">
                    <span class="range-excellent">70%+: Excellent - Strong mandate, easy to pass policies</span>
                  </div>
                  <div class="approval-range">
                    <span class="range-good">50-70%: Good - Stable position, normal governance</span>
                  </div>
                  <div class="approval-range">
                    <span class="range-caution">30-50%: Caution - Vulnerable, difficult to govern</span>
                  </div>
                  <div class="approval-range">
                    <span class="range-danger">Below 30%: Danger - Risk of losing power</span>
                  </div>
                </div>
              </div>

              <div class="coalition-system">
                <h3>Coalition Management</h3>
                <p>You need parliamentary support to pass legislation:</p>
                <ul>
                  <li><strong>Government Party:</strong> Your core support base</li>
                  <li><strong>Coalition Partners:</strong> Allies who support you conditionally</li>
                  <li><strong>Opposition:</strong> Parties that oppose your agenda</li>
                  <li><strong>Independents:</strong> Swing votes that can be persuaded</li>
                </ul>
              </div>

              <div class="election-system">
                <h3>Elections</h3>
                <p>Face voters every 4 years (208 weeks). Your chances depend on:</p>
                <ul>
                  <li>Final year approval rating</li>
                  <li>Economic performance during your term</li>
                  <li>Major achievements and failures</li>
                  <li>Scandal management</li>
                  <li>Opposition strength</li>
                </ul>
              </div>
            </div>
          `
        },
        save_system: {
          title: 'Saving & Loading Games',
          icon: '💾',
          content: `
            <div class="guide-saves">
              <h2>Saving & Loading Games</h2>
              
              <div class="save-overview">
                <h3>Save System Overview</h3>
                <p>SP_Sim automatically saves your progress and allows you to create manual save points to preserve important moments in your political career.</p>
              </div>

              <div class="save-types">
                <h3>Types of Saves</h3>
                <div class="save-type">
                  <h4>🔄 Auto-Save</h4>
                  <p>The game automatically saves every 4 weeks. This ensures you don't lose progress if something goes wrong. Auto-saves are overwritten each time.</p>
                </div>
                
                <div class="save-type">
                  <h4>💾 Manual Saves</h4>
                  <p>Create named save files at any time using the "Save Game" button or Ctrl+S. These are permanent and won't be overwritten.</p>
                </div>
              </div>

              <div class="save-tips">
                <h3>Saving Tips</h3>
                <ul>
                  <li><strong>Save before major decisions:</strong> Create saves before important policy votes or crisis responses</li>
                  <li><strong>Name saves meaningfully:</strong> Use names like "Pre-Election 2024" or "Economic Crisis Start"</li>
                  <li><strong>Regular manual saves:</strong> Don't rely only on auto-save</li>
                  <li><strong>Experiment freely:</strong> You can always reload if a decision doesn't work out</li>
                  <li><strong>Keep multiple saves:</strong> The game stores up to 10 manual saves</li>
                </ul>
              </div>

              <div class="save-management">
                <h3>Managing Save Files</h3>
                <ul>
                  <li><strong>Export saves:</strong> Download save files to backup or share</li>
                  <li><strong>Import saves:</strong> Load save files from other devices</li>
                  <li><strong>Delete old saves:</strong> Remove saves you no longer need</li>
                  <li><strong>Storage usage:</strong> Check how much browser storage you're using</li>
                </ul>
              </div>
            </div>
          `
        }
      },
      advanced: {
        mechanics: {
          title: 'Advanced Game Mechanics',
          icon: '⚙️',
          content: `
            <div class="guide-advanced-mechanics">
              <h2>Advanced Game Mechanics</h2>
              
              <div class="complex-systems">
                <h3>Complex System Interactions</h3>
                <p>Understanding how different systems interact is key to mastering SP_Sim:</p>
                
                <div class="system-interaction">
                  <h4>Economic-Political Feedback Loops</h4>
                  <ul>
                    <li>Economic performance affects approval ratings with 2-3 week delay</li>
                    <li>Political instability can hurt economic confidence</li>
                    <li>Election years often see economic manipulation attempts</li>
                    <li>Coalition stability affects market confidence</li>
                  </ul>
                </div>

                <div class="system-interaction">
                  <h4>International Relations Impact</h4>
                  <ul>
                    <li>Trade relationships affect economic growth</li>
                    <li>Diplomatic crises can trigger economic sanctions</li>
                    <li>International standing affects foreign investment</li>
                    <li>Global economic cycles influence domestic economy</li>
                  </ul>
                </div>
              </div>

              <div class="hidden-mechanics">
                <h3>Hidden Mechanics</h3>
                <div class="mechanic-detail">
                  <h4>Economic Cycles</h4>
                  <p>The economy follows realistic boom-bust cycles lasting 8-12 years. Understanding where you are in the cycle helps predict future challenges.</p>
                </div>
                
                <div class="mechanic-detail">
                  <h4>Scandal Accumulation</h4>
                  <p>Minor scandals accumulate over time. Even if individual scandals are handled well, accumulated scandal points can trigger major crises.</p>
                </div>
                
                <div class="mechanic-detail">
                  <h4>Coalition Fatigue</h4>
                  <p>Coalition partners become harder to maintain over time. Fresh coalitions are more stable than ones that have been together for years.</p>
                </div>
              </div>

              <div class="optimization-strategies">
                <h3>Optimization Strategies</h3>
                <ul>
                  <li><strong>Timing is everything:</strong> Major reforms work best early in your term</li>
                  <li><strong>Build political capital:</strong> High approval early allows for unpopular but necessary policies later</li>
                  <li><strong>Diversify your coalition:</strong> Don't rely on a single partner for your majority</li>
                  <li><strong>Plan for cycles:</strong> Prepare for economic downturns during good times</li>
                  <li><strong>International leverage:</strong> Use foreign policy success to boost domestic standing</li>
                </ul>
              </div>
            </div>
          `
        },
        strategy: {
          title: 'Advanced Political Strategy',
          icon: '🎯',
          content: `
            <div class="guide-strategy">
              <h2>Advanced Political Strategy</h2>
              
              <div class="strategic-thinking">
                <h3>Long-Term Strategic Thinking</h3>
                <p>Successful leaders think beyond immediate challenges and plan for long-term success:</p>
                
                <div class="strategy-framework">
                  <h4>The Four-Year Election Cycle</h4>
                  <div class="cycle-breakdown">
                    <div class="cycle-phase">
                      <h5>Year 1: Honeymoon & Reforms</h5>
                      <ul>
                        <li>Highest approval and political capital</li>
                        <li>Best time for difficult but necessary reforms</li>
                        <li>Establish your policy agenda</li>
                        <li>Build international relationships</li>
                      </ul>
                    </div>
                    
                    <div class="cycle-phase">
                      <h5>Year 2-3: Implementation & Midterm</h5>
                      <ul>
                        <li>Focus on implementing promised policies</li>
                        <li>Handle inevitable crises and challenges</li>
                        <li>Adjust policies based on results</li>
                        <li>Maintain coalition stability</li>
                      </ul>
                    </div>
                    
                    <div class="cycle-phase">
                      <h5>Year 4: Pre-Election</h5>
                      <ul>
                        <li>Highlight achievements and successes</li>
                        <li>Avoid unpopular decisions</li>
                        <li>Focus on vote-winning policies</li>
                        <li>Prepare for campaign season</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="crisis-management">
                <h3>Crisis Management Strategies</h3>
                <div class="crisis-type">
                  <h4>Economic Crises</h4>
                  <ul>
                    <li><strong>Act quickly:</strong> Decisive action is better than delay</li>
                    <li><strong>Communicate clearly:</strong> Explain your plan to the public</li>
                    <li><strong>Accept short-term pain:</strong> Sometimes recession is necessary to prevent worse outcomes</li>
                    <li><strong>Build consensus:</strong> Get opposition support for major reforms</li>
                  </ul>
                </div>
                
                <div class="crisis-type">
                  <h4>Political Scandals</h4>
                  <ul>
                    <li><strong>Full disclosure:</strong> Cover-ups usually make things worse</li>
                    <li><strong>Take responsibility:</strong> Accept blame for failures under your watch</li>
                    <li><strong>Implement reforms:</strong> Show you're fixing the underlying problems</li>
                    <li><strong>Stay focused:</strong> Don't let scandals derail your entire agenda</li>
                  </ul>
                </div>
                
                <div class="crisis-type">
                  <h4>International Crises</h4>
                  <ul>
                    <li><strong>Rally effect:</strong> Foreign crises can boost domestic approval if handled well</li>
                    <li><strong>Multilateral approach:</strong> Work with allies when possible</li>
                    <li><strong>Proportional response:</strong> Match your response to the threat level</li>
                    <li><strong>Domestic priorities:</strong> Don't let foreign issues overshadow domestic needs</li>
                  </ul>
                </div>
              </div>

              <div class="advanced-tactics">
                <h3>Advanced Political Tactics</h3>
                <ul>
                  <li><strong>Issue ownership:</strong> Become the trusted voice on key topics</li>
                  <li><strong>Agenda setting:</strong> Control what issues the public focuses on</li>
                  <li><strong>Strategic ambiguity:</strong> Sometimes vague positions help build broader coalitions</li>
                  <li><strong>Policy bundling:</strong> Package popular and unpopular policies together</li>
                  <li><strong>Opposition management:</strong> Keep opponents divided, find common ground when beneficial</li>
                </ul>
              </div>
            </div>
          `
        },
        economics: {
          title: 'Advanced Economic Management',
          icon: '📈',
          content: `
            <div class="guide-advanced-economics">
              <h2>Advanced Economic Management</h2>
              
              <div class="economic-theory">
                <h3>Economic Theory in Practice</h3>
                <p>SP_Sim's economic model incorporates real-world economic principles:</p>
                
                <div class="theory-section">
                  <h4>Keynesian vs. Supply-Side Economics</h4>
                  <div class="theory-comparison">
                    <div class="theory-approach">
                      <h5>Keynesian Approach (Demand-Side)</h5>
                      <ul>
                        <li>Increase government spending during recessions</li>
                        <li>Lower interest rates to stimulate borrowing</li>
                        <li>Accept higher deficits to maintain employment</li>
                        <li>Focus on aggregate demand management</li>
                      </ul>
                    </div>
                    
                    <div class="theory-approach">
                      <h5>Supply-Side Approach</h5>
                      <ul>
                        <li>Cut taxes to incentivize production</li>
                        <li>Reduce regulations to lower business costs</li>
                        <li>Focus on long-term growth over short-term stability</li>
                        <li>Emphasize productivity and competitiveness</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="policy-tools">
                <h3>Advanced Policy Tools</h3>
                <div class="tool-category">
                  <h4>Fiscal Policy</h4>
                  <ul>
                    <li><strong>Progressive taxation:</strong> Higher rates on wealthy, more redistribution</li>
                    <li><strong>Flat taxation:</strong> Same rate for all, simpler but less redistributive</li>
                    <li><strong>Infrastructure spending:</strong> Boosts short-term demand, long-term productivity</li>
                    <li><strong>Social spending:</strong> Provides safety net but can reduce work incentives</li>
                  </ul>
                </div>
                
                <div class="tool-category">
                  <h4>Monetary Policy Coordination</h4>
                  <ul>
                    <li><strong>Interest rate policy:</strong> Lower rates stimulate economy but risk inflation</li>
                    <li><strong>Currency policy:</strong> Weak currency helps exports, strong currency helps imports</li>
                    <li><strong>Banking regulation:</strong> Stricter rules prevent crises but may limit growth</li>
                  </ul>
                </div>
                
                <div class="tool-category">
                  <h4>Structural Reforms</h4>
                  <ul>
                    <li><strong>Labor market flexibility:</strong> Easier hiring/firing can boost employment</li>
                    <li><strong>Education investment:</strong> Long-term productivity gains</li>
                    <li><strong>Innovation incentives:</strong> R&D tax credits, patent protection</li>
                    <li><strong>Trade policy:</strong> Free trade vs. protectionism trade-offs</li>
                  </ul>
                </div>
              </div>

              <div class="economic-indicators-advanced">
                <h3>Reading Economic Indicators Like a Pro</h3>
                <div class="indicator-analysis">
                  <h4>Leading Indicators</h4>
                  <p>These predict future economic performance:</p>
                  <ul>
                    <li><strong>Business confidence:</strong> Predicts investment and hiring</li>
                    <li><strong>Consumer confidence:</strong> Predicts spending patterns</li>
                    <li><strong>Stock market performance:</strong> Reflects expectations</li>
                    <li><strong>Currency movements:</strong> Show international confidence</li>
                  </ul>
                </div>
                
                <div class="indicator-analysis">
                  <h4>Lagging Indicators</h4>
                  <p>These confirm trends that have already started:</p>
                  <ul>
                    <li><strong>Unemployment rate:</strong> Responds slowly to policy changes</li>
                    <li><strong>GDP growth:</strong> Measured quarterly, reports past performance</li>
                    <li><strong>Government debt ratio:</strong> Accumulates over time</li>
                  </ul>
                </div>
              </div>

              <div class="economic-scenarios">
                <h3>Managing Different Economic Scenarios</h3>
                <div class="scenario">
                  <h4>Recession Response</h4>
                  <ol>
                    <li>Act quickly - speed matters more than perfection</li>
                    <li>Combine fiscal stimulus with monetary easing</li>
                    <li>Focus on employment-intensive projects</li>
                    <li>Provide targeted help to vulnerable groups</li>
                    <li>Communicate confidence in eventual recovery</li>
                  </ol>
                </div>
                
                <div class="scenario">
                  <h4>Inflation Control</h4>
                  <ol>
                    <li>Reduce government spending or raise taxes</li>
                    <li>Support central bank interest rate increases</li>
                    <li>Address supply-side bottlenecks</li>
                    <li>Avoid wage-price spiral through dialogue</li>
                    <li>Monitor expectations carefully</li>
                  </ol>
                </div>
                
                <div class="scenario">
                  <h4>Structural Reform During Growth</h4>
                  <ol>
                    <li>Use good times to build fiscal buffers</li>
                    <li>Invest in productivity-enhancing infrastructure</li>
                    <li>Reform inefficient sectors</li>
                    <li>Strengthen institutions and governance</li>
                    <li>Prepare for the next downturn</li>
                  </ol>
                </div>
              </div>
            </div>
          `
        }
      }
    };
  }

  /**
   * Create guide structure
   */
  createGuideStructure() {
    this.element = this.createElement('div', 'player-guide');
    this.element.innerHTML = `
      <div class="guide-header">
        <div class="guide-title">
          <h2>📚 Player Guide</h2>
          <p>Your complete guide to mastering SP_Sim</p>
        </div>
        <div class="guide-mode-switch">
          <button class="mode-btn active" data-mode="basic" type="button">Basic Guide</button>
          <button class="mode-btn" data-mode="advanced" type="button">Advanced Guide</button>
        </div>
      </div>
      
      <div class="guide-content">
        <div class="guide-sidebar">
          <nav class="guide-nav" id="guide-nav-basic">
            <!-- Basic navigation will be populated -->
          </nav>
          <nav class="guide-nav hidden" id="guide-nav-advanced">
            <!-- Advanced navigation will be populated -->
          </nav>
        </div>
        
        <div class="guide-main">
          <div class="guide-section-content" id="guide-section-content">
            <!-- Content will be populated -->
          </div>
        </div>
      </div>
      
      <div class="guide-footer">
        <div class="guide-progress">
          <span class="progress-text">Progress through guide</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
        </div>
        <div class="guide-actions">
          <button class="guide-btn guide-prev" disabled type="button">← Previous</button>
          <button class="guide-btn guide-next" type="button">Next →</button>
          <button class="guide-btn guide-close" type="button">Close Guide</button>
        </div>
      </div>
    `;

    this.setupGuideNavigation();
    this.setupEventListeners();
    this.showSection('overview');
  }

  /**
   * Setup guide navigation
   */
  setupGuideNavigation() {
    // Setup basic navigation
    const basicNav = this.element.querySelector('#guide-nav-basic');
    const basicSections = Object.keys(this.guideData.basic);
    basicNav.innerHTML = basicSections.map(section => `
      <button class="guide-nav-item ${section === 'overview' ? 'active' : ''}" 
              data-section="${section}" 
              data-mode="basic" 
              type="button">
        <span class="nav-icon">${this.guideData.basic[section].icon}</span>
        <span class="nav-title">${this.guideData.basic[section].title}</span>
      </button>
    `).join('');

    // Setup advanced navigation
    const advancedNav = this.element.querySelector('#guide-nav-advanced');
    const advancedSections = Object.keys(this.guideData.advanced);
    advancedNav.innerHTML = advancedSections.map(section => `
      <button class="guide-nav-item" 
              data-section="${section}" 
              data-mode="advanced" 
              type="button">
        <span class="nav-icon">${this.guideData.advanced[section].icon}</span>
        <span class="nav-title">${this.guideData.advanced[section].title}</span>
      </button>
    `).join('');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mode switching
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.classList.contains('mode-btn')) {
        this.switchMode(e.target.dataset.mode);
      }
    });

    // Navigation
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.closest('.guide-nav-item')) {
        const navItem = e.target.closest('.guide-nav-item');
        this.showSection(navItem.dataset.section, navItem.dataset.mode);
      }
    });

    // Guide actions
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.classList.contains('guide-prev')) {
        this.navigatePrevious();
      } else if (e.target.classList.contains('guide-next')) {
        this.navigateNext();
      } else if (e.target.classList.contains('guide-close')) {
        this.hide();
      }
    });

    // Keyboard navigation
    this.addEventListener(document, 'keydown', (e) => {
      if (!this.element.classList.contains('guide-visible')) return;
      
      if (e.key === 'ArrowLeft' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        this.navigatePrevious();
      } else if (e.key === 'ArrowRight' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        this.navigateNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    });
  }

  /**
   * Switch between basic and advanced modes
   */
  switchMode(mode) {
    this.currentMode = mode;
    
    // Update mode buttons
    this.element.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show appropriate navigation
    this.element.querySelectorAll('.guide-nav').forEach(nav => {
      nav.classList.toggle('hidden', !nav.id.includes(mode));
    });

    // Show first section of new mode
    const firstSection = Object.keys(this.guideData[mode])[0];
    this.showSection(firstSection, mode);
  }

  /**
   * Show specific guide section
   */
  showSection(section, mode = this.currentMode) {
    this.currentSection = section;
    this.currentMode = mode;

    // Update navigation
    this.element.querySelectorAll('.guide-nav-item').forEach(item => {
      item.classList.toggle('active', 
        item.dataset.section === section && item.dataset.mode === mode);
    });

    // Update content
    const content = this.element.querySelector('#guide-section-content');
    const sectionData = this.guideData[mode][section];
    
    content.innerHTML = sectionData.content;
    content.scrollTop = 0;

    // Update progress
    this.updateProgress();
    
    // Update navigation buttons
    this.updateNavigationButtons();
  }

  /**
   * Navigate to previous section
   */
  navigatePrevious() {
    const sections = Object.keys(this.guideData[this.currentMode]);
    const currentIndex = sections.indexOf(this.currentSection);
    
    if (currentIndex > 0) {
      this.showSection(sections[currentIndex - 1]);
    } else if (this.currentMode === 'advanced') {
      // Switch to basic mode, last section
      const basicSections = Object.keys(this.guideData.basic);
      this.switchMode('basic');
      this.showSection(basicSections[basicSections.length - 1]);
    }
  }

  /**
   * Navigate to next section
   */
  navigateNext() {
    const sections = Object.keys(this.guideData[this.currentMode]);
    const currentIndex = sections.indexOf(this.currentSection);
    
    if (currentIndex < sections.length - 1) {
      this.showSection(sections[currentIndex + 1]);
    } else if (this.currentMode === 'basic') {
      // Switch to advanced mode, first section
      const advancedSections = Object.keys(this.guideData.advanced);
      this.switchMode('advanced');
      this.showSection(advancedSections[0]);
    }
  }

  /**
   * Update progress indicator
   */
  updateProgress() {
    const allSections = [
      ...Object.keys(this.guideData.basic),
      ...Object.keys(this.guideData.advanced)
    ];
    
    const currentSections = Object.keys(this.guideData[this.currentMode]);
    const currentIndex = currentSections.indexOf(this.currentSection);
    const modeOffset = this.currentMode === 'advanced' ? Object.keys(this.guideData.basic).length : 0;
    const totalIndex = modeOffset + currentIndex;
    
    const progress = ((totalIndex + 1) / allSections.length) * 100;
    
    const progressFill = this.element.querySelector('.progress-fill');
    const progressText = this.element.querySelector('.progress-text');
    
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Progress: ${totalIndex + 1}/${allSections.length} sections`;
  }

  /**
   * Update navigation buttons
   */
  updateNavigationButtons() {
    const sections = Object.keys(this.guideData[this.currentMode]);
    const currentIndex = sections.indexOf(this.currentSection);
    
    const prevBtn = this.element.querySelector('.guide-prev');
    const nextBtn = this.element.querySelector('.guide-next');
    
    // Previous button
    const canGoPrev = currentIndex > 0 || this.currentMode === 'advanced';
    prevBtn.disabled = !canGoPrev;
    
    // Next button
    const canGoNext = currentIndex < sections.length - 1 || this.currentMode === 'basic';
    nextBtn.disabled = !canGoNext;
    
    // Update next button text for mode transition
    if (this.currentMode === 'basic' && currentIndex === sections.length - 1) {
      nextBtn.textContent = 'Advanced Guide →';
    } else {
      nextBtn.textContent = 'Next →';
    }
  }

  /**
   * Show guide as modal
   */
  showModal() {
    const modal = new Modal({
      title: 'Player Guide',
      content: this.element.outerHTML,
      size: 'large',
      showCancel: false,
      confirmText: 'Close',
      onConfirm: () => true
    });

    modal.show();
    
    // Re-setup event listeners for modal content
    const modalContent = document.querySelector('.modal .player-guide');
    if (modalContent) {
      // Copy the functionality to the modal version
      this.element = modalContent;
      this.setupEventListeners();
      this.showSection(this.currentSection, this.currentMode);
    }
  }

  /**
   * Show guide inline
   */
  show(container) {
    if (container) {
      container.appendChild(this.element);
    }
    this.element.classList.add('guide-visible');
    return this.element;
  }

  /**
   * Hide guide
   */
  hide() {
    this.element.classList.remove('guide-visible');
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Get guide statistics
   */
  getStats() {
    return {
      currentMode: this.currentMode,
      currentSection: this.currentSection,
      totalBasicSections: Object.keys(this.guideData.basic).length,
      totalAdvancedSections: Object.keys(this.guideData.advanced).length,
      isVisible: this.element.classList.contains('guide-visible')
    };
  }
}

export default PlayerGuide;