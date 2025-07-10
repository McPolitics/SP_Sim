;
(function () {
  System.register([], function (exports, module) {
    'use strict';

    return {
      execute: function () {
        /**
         * EventSystem - Centralized event handling and dispatching for SP_Sim
         * Enables loose coupling between game modules through event-driven architecture
         */
        class EventSystem {
          constructor() {
            this.listeners = new Map();
            this.eventQueue = [];
            this.isProcessing = false;
          }

          /**
           * Subscribe to an event type
           * @param {string} eventType - The type of event to listen for
           * @param {Function} callback - Function to call when event is dispatched
           * @param {Object} context - Optional context for the callback
           * @returns {Function} Unsubscribe function
           */
          on(eventType, callback, context = null) {
            if (!this.listeners.has(eventType)) {
              this.listeners.set(eventType, []);
            }
            const listener = {
              callback,
              context
            };
            this.listeners.get(eventType).push(listener);

            // Return unsubscribe function
            return () => this.off(eventType, callback);
          }

          /**
           * Unsubscribe from an event type
           * @param {string} eventType - The event type to unsubscribe from
           * @param {Function} callback - The callback function to remove
           */
          off(eventType, callback) {
            if (!this.listeners.has(eventType)) return;
            const listeners = this.listeners.get(eventType);
            const index = listeners.findIndex(listener => listener.callback === callback);
            if (index !== -1) {
              listeners.splice(index, 1);
            }

            // Clean up empty listener arrays
            if (listeners.length === 0) {
              this.listeners.delete(eventType);
            }
          }

          /**
           * Dispatch an event immediately
           * @param {string} eventType - The type of event to dispatch
           * @param {Object} data - Data to pass to event listeners
           */
          emit(eventType, data = {}) {
            if (!this.listeners.has(eventType)) return;
            const event = {
              type: eventType,
              data,
              timestamp: Date.now()
            };
            const listeners = this.listeners.get(eventType);

            // Create a copy to avoid issues if listeners are modified during iteration
            [...listeners].forEach(listener => {
              try {
                if (listener.context) {
                  listener.callback.call(listener.context, event);
                } else {
                  listener.callback(event);
                }
              } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
              }
            });
          }

          /**
           * Queue an event for later processing
           * @param {string} eventType - The type of event to queue
           * @param {Object} data - Data to pass to event listeners
           */
          queue(eventType, data = {}) {
            this.eventQueue.push({
              type: eventType,
              data,
              timestamp: Date.now()
            });
          }

          /**
           * Process all queued events
           */
          processQueue() {
            if (this.isProcessing) return;
            this.isProcessing = true;
            while (this.eventQueue.length > 0) {
              const event = this.eventQueue.shift();
              this.emit(event.type, event.data);
            }
            this.isProcessing = false;
          }

          /**
           * Clear all event listeners
           */
          clear() {
            this.listeners.clear();
            this.eventQueue = [];
            this.isProcessing = false;
          }

          /**
           * Get statistics about the event system
           * @returns {Object} Event system statistics
           */
          getStats() {
            return {
              eventTypes: this.listeners.size,
              totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
              queuedEvents: this.eventQueue.length,
              isProcessing: this.isProcessing
            };
          }
        }

        // Event type constants for better maintainability
        const EVENTS = exports("E", {
          // Game flow events
          GAME_START: 'game:start',
          GAME_PAUSE: 'game:pause',
          GAME_RESUME: 'game:resume',
          GAME_SAVE: 'game:save',
          GAME_LOAD: 'game:load',
          TURN_START: 'turn:start',
          TURN_END: 'turn:end',
          // Political events
          APPROVAL_CHANGE: 'politics:approval_change',
          POLICY_PROPOSED: 'politics:policy_proposed',
          // UI events
          UI_UPDATE: 'ui:update',
          UI_NOTIFICATION: 'ui:notification',
          UI_ERROR: 'ui:error'
        });

        // Create and export global event system instance
        const eventSystem = exports("e", new EventSystem());

        /**
         * SaveSystem - Game save/load functionality using localStorage with compression
         * Handles game state persistence and recovery
         */
        class SaveSystem {
          constructor() {
            this.storageKey = 'sp_sim_saves';
            this.autoSaveKey = 'sp_sim_autosave';
            this.maxSaves = 10;
            this.compressionEnabled = true;
          }

          /**
           * Save game state
           * @param {Object} gameState - Complete game state object
           * @param {string} saveName - Optional name for the save file
           * @returns {boolean} Success status
           */
          saveGame(gameState, saveName = null) {
            try {
              const saveData = this.prepareSaveData(gameState, saveName);
              const saves = this.getAllSaves();

              // Add new save
              saves.unshift(saveData);

              // Limit number of saves
              if (saves.length > this.maxSaves) {
                saves.splice(this.maxSaves);
              }

              // Store updated saves list
              localStorage.setItem(this.storageKey, JSON.stringify(saves));
              console.log(`Game saved successfully: ${saveData.name}`);
              return true;
            } catch (error) {
              console.error('Failed to save game:', error);
              return false;
            }
          }

          /**
           * Load game state
           * @param {string} saveId - ID of the save to load
           * @returns {Object|null} Game state or null if failed
           */
          loadGame(saveId) {
            try {
              const saves = this.getAllSaves();
              const saveData = saves.find(save => save.id === saveId);
              if (!saveData) {
                console.error(`Save not found: ${saveId}`);
                return null;
              }
              const gameState = this.decompressData(saveData.data);
              console.log(`Game loaded successfully: ${saveData.name}`);
              return gameState;
            } catch (error) {
              console.error('Failed to load game:', error);
              return null;
            }
          }

          /**
           * Auto-save game state (overwrites previous auto-save)
           * @param {Object} gameState - Complete game state object
           * @returns {boolean} Success status
           */
          autoSave(gameState) {
            try {
              const saveData = this.prepareSaveData(gameState, 'Auto Save');
              localStorage.setItem(this.autoSaveKey, JSON.stringify(saveData));
              return true;
            } catch (error) {
              console.error('Auto-save failed:', error);
              return false;
            }
          }

          /**
           * Load auto-save
           * @returns {Object|null} Game state or null if no auto-save exists
           */
          loadAutoSave() {
            try {
              const autoSaveData = localStorage.getItem(this.autoSaveKey);
              if (!autoSaveData) return null;
              const saveData = JSON.parse(autoSaveData);
              return this.decompressData(saveData.data);
            } catch (error) {
              console.error('Failed to load auto-save:', error);
              return null;
            }
          }

          /**
           * Get all saved games
           * @returns {Array} Array of save metadata
           */
          getAllSaves() {
            try {
              const saves = localStorage.getItem(this.storageKey);
              return saves ? JSON.parse(saves) : [];
            } catch (error) {
              console.error('Failed to retrieve saves:', error);
              return [];
            }
          }

          /**
           * Delete a specific save
           * @param {string} saveId - ID of save to delete
           * @returns {boolean} Success status
           */
          deleteSave(saveId) {
            try {
              const saves = this.getAllSaves();
              const filteredSaves = saves.filter(save => save.id !== saveId);
              localStorage.setItem(this.storageKey, JSON.stringify(filteredSaves));
              console.log(`Save deleted: ${saveId}`);
              return true;
            } catch (error) {
              console.error('Failed to delete save:', error);
              return false;
            }
          }

          /**
           * Clear all saves
           * @returns {boolean} Success status
           */
          clearAllSaves() {
            try {
              localStorage.removeItem(this.storageKey);
              localStorage.removeItem(this.autoSaveKey);
              console.log('All saves cleared');
              return true;
            } catch (error) {
              console.error('Failed to clear saves:', error);
              return false;
            }
          }

          /**
           * Export save data as downloadable file
           * @param {string} saveId - ID of save to export
           * @returns {boolean} Success status
           */
          exportSave(saveId) {
            try {
              const saves = this.getAllSaves();
              const saveData = saves.find(save => save.id === saveId);
              if (!saveData) {
                console.error(`Save not found for export: ${saveId}`);
                return false;
              }
              const dataStr = JSON.stringify(saveData, null, 2);
              const dataBlob = new Blob([dataStr], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `sp_sim_save_${saveData.name.replace(/\s+/g, '_')}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              return true;
            } catch (error) {
              console.error('Failed to export save:', error);
              return false;
            }
          }

          /**
           * Import save data from file
           * @param {File} file - Save file to import
           * @returns {Promise<boolean>} Success status
           */
          async importSave(file) {
            try {
              const text = await file.text();
              const saveData = JSON.parse(text);

              // Validate save data structure
              if (!this.validateSaveData(saveData)) {
                console.error('Invalid save file format');
                return false;
              }

              // Generate new ID to avoid conflicts
              saveData.id = this.generateSaveId();
              saveData.imported = true;
              const saves = this.getAllSaves();
              saves.unshift(saveData);
              localStorage.setItem(this.storageKey, JSON.stringify(saves));
              console.log(`Save imported successfully: ${saveData.name}`);
              return true;
            } catch (error) {
              console.error('Failed to import save:', error);
              return false;
            }
          }

          /**
           * Get storage usage statistics
           * @returns {Object} Storage usage information
           */
          getStorageStats() {
            try {
              const saves = this.getAllSaves();
              const autoSave = localStorage.getItem(this.autoSaveKey);
              const savesSize = new Blob([localStorage.getItem(this.storageKey) || '']).size;
              const autoSaveSize = new Blob([autoSave || '']).size;
              const totalSize = savesSize + autoSaveSize;
              return {
                saveCount: saves.length,
                totalSizeBytes: totalSize,
                totalSizeKB: Math.round(totalSize / 1024),
                hasAutoSave: !!autoSave,
                maxSaves: this.maxSaves
              };
            } catch (error) {
              console.error('Failed to get storage stats:', error);
              return null;
            }
          }

          /**
           * Prepare save data with metadata
           * @private
           */
          prepareSaveData(gameState, saveName) {
            const now = new Date();
            const name = saveName || `Save ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
            return {
              id: this.generateSaveId(),
              name,
              timestamp: now.toISOString(),
              version: gameState.version || '1.0.0',
              gameTime: gameState.time || {},
              data: this.compressData(gameState)
            };
          }

          /**
           * Generate unique save ID
           * @private
           */
          generateSaveId() {
            return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }

          /**
           * Compress game state data
           * @private
           */
          compressData(data) {
            if (!this.compressionEnabled) return data;
            try {
              // Simple JSON compression by removing whitespace
              // In a production environment, you might want to use a proper compression library
              return JSON.stringify(data);
            } catch (error) {
              console.error('Compression failed:', error);
              return data;
            }
          }

          /**
           * Decompress game state data
           * @private
           */
          decompressData(data) {
            if (!this.compressionEnabled) return data;
            try {
              return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (error) {
              console.error('Decompression failed:', error);
              return data;
            }
          }

          /**
           * Validate save data structure
           * @private
           */
          validateSaveData(saveData) {
            return saveData && typeof saveData === 'object' && saveData.id && saveData.name && saveData.timestamp && saveData.data;
          }
        }

        // Create and export global save system instance
        const saveSystem = new SaveSystem();

        /**
         * EconomicSimulation - Models economic metrics and their interactions
         * Implements GDP, unemployment, inflation, and economic cycles
         */
        class EconomicSimulation {
          constructor() {
            this.metrics = {
              gdp: 1000000000000,
              // $1 trillion baseline
              gdpGrowth: 2.1,
              unemployment: 6.0,
              inflation: 2.4,
              interestRate: 3.5,
              consumerSpending: 0.65,
              // 65% of GDP
              governmentSpending: 0.20,
              // 20% of GDP
              investment: 0.18,
              // 18% of GDP
              netExports: -0.03,
              // -3% of GDP (trade deficit)
              productivity: 1.0,
              // Baseline productivity index
              confidence: 75 // Consumer/business confidence (0-100)
            };
            this.sectors = {
              agriculture: {
                share: 0.05,
                growth: 1.2,
                volatility: 0.15
              },
              manufacturing: {
                share: 0.25,
                growth: 2.8,
                volatility: 0.10
              },
              services: {
                share: 0.70,
                growth: 2.0,
                volatility: 0.05
              }
            };
            this.cycle = {
              phase: 'expansion',
              // recession, trough, expansion, peak
              duration: 0,
              // weeks in current phase
              intensity: 0.5 // 0-1 scale
            };
            this.shocks = [];
            this.policies = [];
            this.setupEventListeners();
          }

          /**
           * Setup event listeners
           */
          setupEventListeners() {
            eventSystem.on(EVENTS.TURN_END, () => {
              this.updateEconomy();
            });
            eventSystem.on('policy:implemented', event => {
              this.applyPolicy(event.data.policy);
            });
            eventSystem.on('economic:shock', event => {
              this.applyShock(event.data.shock);
            });
          }

          /**
           * Update economic metrics each turn
           */
          updateEconomy() {
            // Update business cycle
            this.updateBusinessCycle();

            // Calculate sector performance
            this.updateSectors();

            // Update core metrics
            this.updateGDP();
            this.updateUnemployment();
            this.updateInflation();
            this.updateConfidence();

            // Apply any active policies
            this.applyActivePolicies();

            // Check for automatic events
            this.checkEconomicEvents();

            // Emit economic update event
            eventSystem.emit('economic:update', {
              metrics: {
                ...this.metrics
              },
              sectors: {
                ...this.sectors
              },
              cycle: {
                ...this.cycle
              }
            });
          }

          /**
           * Update business cycle
           */
          updateBusinessCycle() {
            this.cycle.duration += 1;

            // Business cycle transitions based on duration and economic conditions
            switch (this.cycle.phase) {
              case 'expansion':
                if (this.cycle.duration > 104 || this.metrics.inflation > 4.5) {
                  // 2 years or high inflation
                  this.cycle.phase = 'peak';
                  this.cycle.duration = 0;
                  this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.1);
                } else {
                  this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.02);
                }
                break;
              case 'peak':
                if (this.cycle.duration > 8 || this.metrics.unemployment > 7.5) {
                  // 2 months or high unemployment
                  this.cycle.phase = 'recession';
                  this.cycle.duration = 0;
                  this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.1);
                }
                break;
              case 'recession':
                if (this.cycle.duration > 52 || this.metrics.gdpGrowth > 0) {
                  // 1 year or positive growth
                  this.cycle.phase = 'trough';
                  this.cycle.duration = 0;
                  this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.02);
                } else {
                  this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.03);
                }
                break;
              case 'trough':
                if (this.cycle.duration > 12 || this.metrics.confidence > 60) {
                  // 3 months or improving confidence
                  this.cycle.phase = 'expansion';
                  this.cycle.duration = 0;
                  this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.05);
                }
                break;
              default:
                // Unknown phase, default to expansion
                this.cycle.phase = 'expansion';
                this.cycle.duration = 0;
                break;
            }
          }

          /**
           * Update sector performance
           */
          updateSectors() {
            Object.keys(this.sectors).forEach(sectorName => {
              const sector = this.sectors[sectorName];

              // Base growth with cycle effects
              let {
                growth
              } = sector;

              // Apply business cycle effects
              const cycleEffect = this.getCycleEffect();
              growth *= cycleEffect;

              // Add volatility
              const volatility = (Math.random() - 0.5) * sector.volatility * 2;
              growth += volatility;

              // Update sector metrics
              sector.currentGrowth = growth;
              sector.cycleEffect = cycleEffect;
            });
          }

          /**
           * Update GDP and GDP growth
           */
          updateGDP() {
            // Calculate weighted sector growth
            let weightedGrowth = 0;
            Object.keys(this.sectors).forEach(sectorName => {
              const sector = this.sectors[sectorName];
              weightedGrowth += sector.share * (sector.currentGrowth || sector.growth);
            });

            // Apply productivity effects
            const productivityEffect = (this.metrics.productivity - 1.0) * 0.5;
            weightedGrowth += productivityEffect;

            // Apply confidence effects
            const confidenceEffect = (this.metrics.confidence - 50) / 100;
            weightedGrowth += confidenceEffect;

            // Update GDP growth (annualized from quarterly)
            this.metrics.gdpGrowth = this.smoothUpdate(this.metrics.gdpGrowth, weightedGrowth, 0.3);

            // Update actual GDP
            const weeklyGrowthRate = this.metrics.gdpGrowth / 52 / 100;
            this.metrics.gdp *= 1 + weeklyGrowthRate;
          }

          /**
           * Update unemployment rate
           */
          updateUnemployment() {
            // Okun's Law: unemployment inversely related to GDP growth
            const targetUnemployment = 6.0 - (this.metrics.gdpGrowth - 2.0) * 0.4;

            // Business cycle effects
            let cycleAdjustment = 0;
            switch (this.cycle.phase) {
              case 'recession':
                cycleAdjustment = 0.5;
                break;
              case 'trough':
                cycleAdjustment = 0.2;
                break;
              case 'expansion':
                cycleAdjustment = -0.3;
                break;
              case 'peak':
                cycleAdjustment = -0.1;
                break;
              default:
                cycleAdjustment = 0;
                break;
            }
            const adjustedTarget = Math.max(3.0, Math.min(12.0, targetUnemployment + cycleAdjustment));
            this.metrics.unemployment = this.smoothUpdate(this.metrics.unemployment, adjustedTarget, 0.2);
          }

          /**
           * Update inflation rate
           */
          updateInflation() {
            // Phillips Curve: inverse relationship with unemployment
            const demandPullInflation = Math.max(0, (7.0 - this.metrics.unemployment) * 0.3);

            // Cost-push inflation from business cycle
            const costPushInflation = this.cycle.intensity * 0.8;

            // Money supply effects (simplified)
            const monetaryInflation = this.metrics.interestRate < 2.0 ? 0.5 : -0.2;
            const targetInflation = 2.0 + demandPullInflation + costPushInflation + monetaryInflation;

            // Add some volatility
            const volatility = (Math.random() - 0.5) * 0.4;
            const adjustedTarget = Math.max(0, targetInflation + volatility);
            this.metrics.inflation = this.smoothUpdate(this.metrics.inflation, adjustedTarget, 0.25);
          }

          /**
           * Update consumer and business confidence
           */
          updateConfidence() {
            let confidenceChange = 0;

            // Economic performance effects
            if (this.metrics.gdpGrowth > 3.0) confidenceChange += 2;else if (this.metrics.gdpGrowth < 0) confidenceChange -= 3;
            if (this.metrics.unemployment < 5.0) confidenceChange += 1;else if (this.metrics.unemployment > 8.0) confidenceChange -= 2;
            if (this.metrics.inflation > 4.0) confidenceChange -= 2;else if (this.metrics.inflation < 1.0) confidenceChange -= 1;

            // Business cycle effects
            switch (this.cycle.phase) {
              case 'expansion':
                confidenceChange += 1;
                break;
              case 'recession':
                confidenceChange -= 2;
                break;
              case 'trough':
                confidenceChange += 0.5; // Recovery hope
                break;
            }

            // Random events
            confidenceChange += (Math.random() - 0.5) * 2;
            this.metrics.confidence = Math.max(0, Math.min(100, this.metrics.confidence + confidenceChange));
          }

          /**
           * Apply economic policy
           */
          applyPolicy(policy) {
            this.policies.push({
              ...policy,
              duration: policy.duration || 12,
              // weeks
              implementedWeek: 0
            });

            // Immediate effects
            switch (policy.type) {
              case 'fiscal_stimulus':
                this.metrics.confidence += 5;
                this.metrics.governmentSpending += policy.amount || 0.02;
                break;
              case 'tax_cut':
                this.metrics.confidence += 3;
                this.metrics.consumerSpending += policy.amount || 0.01;
                break;
              case 'tax_increase':
                this.metrics.confidence -= 4;
                this.metrics.consumerSpending -= policy.amount || 0.015;
                break;
              case 'interest_rate_change':
                this.metrics.interestRate += policy.change || 0;
                break;
              case 'infrastructure_investment':
                this.metrics.productivity += policy.amount || 0.05;
                this.sectors.manufacturing.growth += policy.amount || 0.5;
                break;
              case 'education_investment':
                this.metrics.productivity += policy.amount || 0.03;
                this.sectors.services.growth += policy.amount || 0.3;
                break;
              case 'healthcare_investment':
                this.metrics.productivity += policy.amount || 0.02;
                this.metrics.confidence += 3;
                break;
              case 'green_energy_investment':
                this.sectors.manufacturing.growth += policy.amount || 0.4;
                this.metrics.productivity += policy.amount || 0.04;
                break;
              case 'trade_promotion':
                this.metrics.netExports += policy.amount || 0.01;
                this.sectors.manufacturing.growth += policy.amount || 0.3;
                break;
              case 'regulation_increase':
                this.sectors.services.growth -= policy.amount || 0.2;
                this.metrics.confidence -= 2;
                break;
              case 'regulation_decrease':
                this.sectors.services.growth += policy.amount || 0.3;
                this.metrics.confidence += 2;
                break;
              case 'agricultural_subsidies':
                this.sectors.agriculture.growth += policy.amount || 0.5;
                this.metrics.governmentSpending += policy.amount || 0.005;
                break;
              case 'minimum_wage_increase':
                this.metrics.consumerSpending += policy.amount || 0.008;
                this.metrics.confidence += 2;
                this.metrics.inflation += policy.amount || 0.3;
                break;
            }
            eventSystem.emit('economic:policy_applied', {
              policy,
              newMetrics: {
                ...this.metrics
              }
            });
          }

          /**
           * Apply active policies each turn
           */
          applyActivePolicies() {
            this.policies = this.policies.filter(policy => {
              policy.implementedWeek += 1;

              // Apply ongoing effects
              if (policy.ongoingEffects) {
                Object.keys(policy.ongoingEffects).forEach(metric => {
                  if (this.metrics[metric] !== undefined) {
                    this.metrics[metric] += policy.ongoingEffects[metric];
                  }
                });
              }

              // Remove expired policies
              return policy.implementedWeek < policy.duration;
            });
          }

          /**
           * Apply economic shock
           */
          applyShock(shock) {
            this.shocks.push(shock);
            switch (shock.type) {
              case 'oil_price_spike':
                this.metrics.inflation += shock.magnitude || 1.0;
                this.metrics.confidence -= shock.magnitude * 5 || 10;
                break;
              case 'financial_crisis':
                this.metrics.confidence -= shock.magnitude * 20 || 30;
                this.cycle.phase = 'recession';
                this.cycle.duration = 0;
                break;
              case 'trade_war':
                this.metrics.netExports -= shock.magnitude || 0.02;
                this.sectors.manufacturing.growth -= shock.magnitude || 1.0;
                break;
              case 'pandemic':
                this.metrics.gdpGrowth -= shock.magnitude || 5.0;
                this.metrics.unemployment += shock.magnitude || 3.0;
                this.sectors.services.growth -= shock.magnitude || 3.0;
                break;
              case 'supply_chain_disruption':
                this.sectors.manufacturing.growth -= shock.magnitude;
                this.sectors.services.growth -= shock.magnitude * 0.5;
                this.metrics.inflation += shock.magnitude * 0.3;
                break;
              case 'commodity_price_spike':
                this.metrics.inflation += shock.magnitude;
                this.sectors.agriculture.growth -= shock.magnitude * 0.8;
                this.metrics.confidence -= shock.magnitude * 3;
                break;
              case 'currency_fluctuation':
                this.metrics.netExports += (Math.random() - 0.5) * shock.magnitude * 0.02;
                this.metrics.inflation += shock.magnitude * 0.2;
                break;
              case 'tech_innovation':
                this.metrics.productivity += shock.magnitude * 0.1;
                this.sectors.services.growth += shock.magnitude;
                this.metrics.confidence += shock.magnitude * 5;
                break;
              case 'natural_disaster':
                this.metrics.gdpGrowth -= shock.magnitude;
                this.sectors.agriculture.growth -= shock.magnitude * 1.5;
                this.metrics.confidence -= shock.magnitude * 8;
                break;
              case 'geopolitical_tension':
                this.metrics.confidence -= shock.magnitude * 6;
                this.metrics.netExports -= shock.magnitude * 0.01;
                this.metrics.investment -= shock.magnitude * 0.01;
                break;
            }
            eventSystem.emit('economic:shock_applied', {
              shock,
              newMetrics: {
                ...this.metrics
              }
            });
          }

          /**
           * Check for automatic economic events
           */
          checkEconomicEvents() {
            const events = [];

            // High inflation warning
            if (this.metrics.inflation > 4.0 && Math.random() < 0.1) {
              events.push({
                type: 'high_inflation_warning',
                message: `Inflation has reached ${this.metrics.inflation.toFixed(1)}%. Consider monetary policy adjustments.`,
                severity: 'warning'
              });
            }

            // Recession warning
            if (this.metrics.gdpGrowth < -1 && this.cycle.phase !== 'recession') {
              events.push({
                type: 'recession_warning',
                message: 'Economic indicators suggest a recession. GDP growth is negative.',
                severity: 'danger'
              });
            }

            // Low unemployment celebration
            if (this.metrics.unemployment < 4.0 && Math.random() < 0.05) {
              events.push({
                type: 'low_unemployment',
                message: `Unemployment has dropped to ${this.metrics.unemployment.toFixed(1)}%. Conditions are favorable.`,
                severity: 'success'
              });
            }

            // Economic boom detection
            if (this.metrics.gdpGrowth > 4.0 && this.metrics.unemployment < 5.0 && Math.random() < 0.08) {
              events.push({
                type: 'economic_boom',
                message: `Economic boom detected! GDP growth at ${this.metrics.gdpGrowth.toFixed(1)}% with low unemployment.`,
                severity: 'success'
              });
            }

            // Deflation warning
            if (this.metrics.inflation < 0.5 && Math.random() < 0.06) {
              events.push({
                type: 'deflation_risk',
                message: `Deflation risk: Inflation is only ${this.metrics.inflation.toFixed(1)}%. Consider stimulus measures.`,
                severity: 'warning'
              });
            }

            // Stagflation detection
            if (this.metrics.inflation > 3.5 && this.metrics.unemployment > 7.0 && this.metrics.gdpGrowth < 1.0 && Math.random() < 0.1) {
              events.push({
                type: 'stagflation',
                message: 'Stagflation detected: High inflation and unemployment with low growth. ' + 'Difficult policy choices ahead.',
                severity: 'danger'
              });
            }

            // Interest rate milestones
            if (this.metrics.interestRate <= 0.5 && Math.random() < 0.05) {
              events.push({
                type: 'zero_interest_rate',
                message: 'Interest rates near zero. Traditional monetary policy effectiveness limited.',
                severity: 'warning'
              });
            }

            // Sector-specific events
            Object.keys(this.sectors).forEach(sectorName => {
              const sector = this.sectors[sectorName];

              // Sector boom
              if (sector.currentGrowth > 5.0 && Math.random() < 0.04) {
                events.push({
                  type: 'sector_boom',
                  message: `${sectorName.charAt(0).toUpperCase() + sectorName.slice(1)} sector ` + `experiencing rapid growth at ${sector.currentGrowth.toFixed(1)}%.`,
                  severity: 'success'
                });
              }

              // Sector decline
              if (sector.currentGrowth < -2 && Math.random() < 0.06) {
                events.push({
                  type: 'sector_decline',
                  message: `${sectorName.charAt(0).toUpperCase() + sectorName.slice(1)} sector ` + `declining at ${sector.currentGrowth.toFixed(1)}%. May need targeted support.`,
                  severity: 'warning'
                });
              }
            });

            // Random economic shocks (Week 8 feature)
            if (Math.random() < 0.02) {
              // 2% chance per week
              const shockType = this.generateRandomShock();
              if (shockType) {
                events.push(shockType);
                this.applyShock(shockType);
              }
            }

            // Confidence milestones
            if (this.metrics.confidence > 85 && Math.random() < 0.03) {
              events.push({
                type: 'high_confidence',
                message: `Consumer confidence at ${this.metrics.confidence.toFixed(0)}%. ` + 'Strong economic sentiment boosting spending.',
                severity: 'success'
              });
            }
            if (this.metrics.confidence < 30 && Math.random() < 0.05) {
              events.push({
                type: 'confidence_crisis',
                message: `Consumer confidence plummeted to ${this.metrics.confidence.toFixed(0)}%. ` + 'Economic uncertainty affecting all sectors.',
                severity: 'danger'
              });
            }

            // Emit events
            events.forEach(event => {
              eventSystem.emit('economic:event', event);
            });
          }

          /**
           * Generate random economic shock (Week 8 feature)
           */
          generateRandomShock() {
            const shocks = [{
              type: 'supply_chain_disruption',
              message: 'Global supply chain disruption affecting manufacturing and services.',
              severity: 'warning',
              magnitude: 0.5 + Math.random() * 1.0
            }, {
              type: 'commodity_price_spike',
              message: 'Commodity prices surge affecting production costs and inflation.',
              severity: 'warning',
              magnitude: 0.3 + Math.random() * 0.7
            }, {
              type: 'currency_fluctuation',
              message: 'Major currency fluctuation impacting trade balance and imports.',
              severity: 'info',
              magnitude: 0.2 + Math.random() * 0.5
            }, {
              type: 'tech_innovation',
              message: 'Technological breakthrough boosting productivity in key sectors.',
              severity: 'success',
              magnitude: 0.3 + Math.random() * 0.4
            }, {
              type: 'natural_disaster',
              message: 'Natural disaster affecting regional economic activity.',
              severity: 'danger',
              magnitude: 0.4 + Math.random() * 0.8
            }, {
              type: 'geopolitical_tension',
              message: 'Geopolitical tensions affecting trade and investor confidence.',
              severity: 'warning',
              magnitude: 0.3 + Math.random() * 0.6
            }];
            return shocks[Math.floor(Math.random() * shocks.length)];
          }

          /**
           * Get business cycle effect multiplier
           */
          getCycleEffect() {
            switch (this.cycle.phase) {
              case 'expansion':
                return 1.0 + this.cycle.intensity * 0.2;
              case 'peak':
                return 1.1;
              case 'recession':
                return 0.8 - this.cycle.intensity * 0.3;
              case 'trough':
                return 0.7;
              default:
                return 1.0;
            }
          }

          /**
           * Smooth update utility for gradual changes
           */
          smoothUpdate(current, target, speed) {
            return current + (target - current) * speed;
          }

          /**
           * Get current economic state
           */
          getEconomicState() {
            return {
              metrics: {
                ...this.metrics
              },
              sectors: {
                ...this.sectors
              },
              cycle: {
                ...this.cycle
              },
              activePolicies: this.policies.length,
              activeShocks: this.shocks.length
            };
          }

          /**
           * Get economic forecast
           */
          getForecast(weeksAhead = 12) {
            // Simple linear projection based on current trends
            const forecast = {
              gdpGrowth: [],
              unemployment: [],
              inflation: []
            };
            let currentGDP = this.metrics.gdpGrowth;
            let currentUnemployment = this.metrics.unemployment;
            let currentInflation = this.metrics.inflation;
            for (let week = 1; week <= weeksAhead; week += 1) {
              // Simple trend continuation with some mean reversion
              currentGDP = this.smoothUpdate(currentGDP, 2.1, 0.05); // Mean revert to 2.1%
              currentUnemployment = this.smoothUpdate(currentUnemployment, 6.0, 0.03); // Mean revert to 6%
              currentInflation = this.smoothUpdate(currentInflation, 2.0, 0.04); // Mean revert to 2%

              forecast.gdpGrowth.push(Number(currentGDP.toFixed(2)));
              forecast.unemployment.push(Number(currentUnemployment.toFixed(1)));
              forecast.inflation.push(Number(currentInflation.toFixed(1)));
            }
            return forecast;
          }
        }

        // Create and export global economic simulation instance
        const economicSimulation = exports("a", new EconomicSimulation());

        /**
         * GameEngine - Core game loop and state management for SP_Sim
         * Orchestrates all game systems and handles the main game loop
         */
        class GameEngine {
          constructor() {
            this.eventSystem = eventSystem;
            this.saveSystem = saveSystem;
            this.economicSimulation = economicSimulation;

            // Game state
            this.gameState = this.createInitialGameState();
            this.isRunning = false;
            this.isPaused = false;
            this.gameSpeed = 1000; // milliseconds per turn
            this.lastUpdateTime = 0;
            this.gameLoopId = null;

            // Performance tracking
            this.frameCount = 0;
            this.lastFrameTime = Date.now();
            this.fps = 0;
            this.initializeEventListeners();
          }

          /**
           * Initialize the game
           */
          initialize() {
            console.log('Initializing SP_Sim Game Engine...');

            // Try to load auto-save
            const autoSave = this.saveSystem.loadAutoSave();
            if (autoSave) {
              this.gameState = autoSave;
              console.log('Auto-save loaded');
            }
            this.eventSystem.emit(EVENTS.GAME_START, {
              gameState: this.gameState
            });
            console.log('Game Engine initialized successfully');
          }

          /**
           * Start the game loop
           */
          start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.isPaused = false;
            this.lastUpdateTime = Date.now();
            this.gameLoop();
            this.eventSystem.emit(EVENTS.GAME_RESUME, {
              gameState: this.gameState
            });
            console.log('Game started');
          }

          /**
           * Pause the game
           */
          pause() {
            if (!this.isRunning || this.isPaused) return;
            this.isPaused = true;
            if (this.gameLoopId) {
              clearTimeout(this.gameLoopId);
              this.gameLoopId = null;
            }
            this.eventSystem.emit(EVENTS.GAME_PAUSE, {
              gameState: this.gameState
            });
            console.log('Game paused');
          }

          /**
           * Resume the game
           */
          resume() {
            if (!this.isRunning || !this.isPaused) return;
            this.isPaused = false;
            this.lastUpdateTime = Date.now();
            this.gameLoop();
            this.eventSystem.emit(EVENTS.GAME_RESUME, {
              gameState: this.gameState
            });
            console.log('Game resumed');
          }

          /**
           * Stop the game
           */
          stop() {
            this.isRunning = false;
            this.isPaused = false;
            if (this.gameLoopId) {
              clearTimeout(this.gameLoopId);
              this.gameLoopId = null;
            }

            // Auto-save when stopping
            this.autoSave();
            console.log('Game stopped');
          }

          /**
           * Advance to next turn manually
           */
          nextTurn() {
            if (!this.isRunning) return;
            this.processTurn();
          }

          /**
           * Main game loop
           */
          gameLoop() {
            if (!this.isRunning || this.isPaused) return;
            const now = Date.now();
            const deltaTime = now - this.lastUpdateTime;

            // Update FPS counter
            this.updateFPS(now);

            // Process turn if enough time has passed
            if (deltaTime >= this.gameSpeed) {
              this.processTurn();
              this.lastUpdateTime = now;
            }

            // Schedule next frame
            this.gameLoopId = setTimeout(() => this.gameLoop(), 16); // ~60 FPS
          }

          /**
           * Process a single turn
           */
          processTurn() {
            this.eventSystem.emit(EVENTS.TURN_START, {
              gameState: this.gameState,
              turn: this.gameState.time.week
            });

            // Advance time
            this.advanceTime();

            // Process queued events
            this.eventSystem.processQueue();

            // Auto-save periodically
            if (this.gameState.time.week % 4 === 0) {
              // Every 4 weeks
              this.autoSave();
            }
            this.eventSystem.emit(EVENTS.TURN_END, {
              gameState: this.gameState,
              turn: this.gameState.time.week
            });
          }

          /**
           * Advance game time
           */
          advanceTime() {
            this.gameState.time.week += 1;

            // Handle month/year transitions
            if (this.gameState.time.week > 52) {
              this.gameState.time.week = 1;
              this.gameState.time.year += 1;
            }

            // Calculate current date
            const startDate = new Date(this.gameState.time.startDate);
            const weeksElapsed = (this.gameState.time.year - 1) * 52 + this.gameState.time.week - 1;
            this.gameState.time.currentDate = new Date(startDate.getTime() + weeksElapsed * 7 * 24 * 60 * 60 * 1000);
          }

          /**
           * Save game manually
           */
          saveGame(saveName = null) {
            const success = this.saveSystem.saveGame(this.gameState, saveName);
            this.eventSystem.emit(EVENTS.GAME_SAVE, {
              success,
              gameState: this.gameState,
              saveName
            });
            return success;
          }

          /**
           * Load game
           */
          loadGame(saveId) {
            const loadedState = this.saveSystem.loadGame(saveId);
            if (loadedState) {
              this.gameState = loadedState;
              this.eventSystem.emit(EVENTS.GAME_LOAD, {
                success: true,
                gameState: this.gameState
              });
              return true;
            }
            this.eventSystem.emit(EVENTS.GAME_LOAD, {
              success: false,
              saveId
            });
            return false;
          }

          /**
           * Auto-save game
           */
          autoSave() {
            return this.saveSystem.autoSave(this.gameState);
          }

          /**
           * Update game state
           */
          updateGameState(updates) {
            // Deep merge updates into game state
            this.gameState = this.mergeDeep(this.gameState, updates);
            this.eventSystem.emit(EVENTS.UI_UPDATE, {
              gameState: this.gameState,
              updates
            });
          }

          /**
           * Get current game state (read-only copy)
           */
          getGameState() {
            return JSON.parse(JSON.stringify(this.gameState));
          }

          /**
           * Get game statistics
           */
          getGameStats() {
            return {
              isRunning: this.isRunning,
              isPaused: this.isPaused,
              gameSpeed: this.gameSpeed,
              fps: this.fps,
              currentTurn: this.gameState.time.week,
              currentYear: this.gameState.time.year,
              playtime: this.calculatePlaytime(),
              eventSystemStats: this.eventSystem.getStats(),
              storageStats: this.saveSystem.getStorageStats()
            };
          }

          /**
           * Set game speed
           */
          setGameSpeed(speed) {
            this.gameSpeed = Math.max(100, Math.min(5000, speed)); // Clamp between 100ms and 5s
            console.log(`Game speed set to ${this.gameSpeed}ms per turn`);
          }

          /**
           * Create initial game state
           * @private
           */
          createInitialGameState() {
            const now = new Date();
            return {
              version: '1.0.0',
              player: {
                name: 'Player',
                party: 'Independent',
                experience: 0,
                skills: {
                  economics: {
                    level: 1,
                    experience: 0
                  },
                  diplomacy: {
                    level: 1,
                    experience: 0
                  },
                  communication: {
                    level: 1,
                    experience: 0
                  },
                  leadership: {
                    level: 1,
                    experience: 0
                  }
                }
              },
              country: {
                name: 'Democracia',
                population: 50000000,
                gdp: 1000000000000,
                // $1 trillion
                debt: 600000000000,
                // 60% of GDP
                stability: 75
              },
              economy: {
                gdpGrowth: 2.1,
                unemployment: 6.0,
                inflation: 2.4,
                interestRate: 3.5,
                sectors: {
                  agriculture: 5,
                  manufacturing: 25,
                  services: 70
                }
              },
              politics: {
                approval: 50,
                coalition: [{
                  party: 'Government',
                  support: 45
                }, {
                  party: 'Coalition Partner',
                  support: 22
                }],
                opposition: [{
                  party: 'Main Opposition',
                  support: 30
                }, {
                  party: 'Minor Opposition',
                  support: 3
                }],
                nextElection: {
                  year: 4,
                  week: 1
                },
                nextVote: null
              },
              global: {
                relations: {
                  'United Federation': 75,
                  'Eastern Empire': 60,
                  'Southern Union': 80
                },
                tradeBalance: 15000000000,
                // $15 billion surplus
                internationalStanding: 'Good'
              },
              time: {
                startDate: now.toISOString(),
                currentDate: now.toISOString(),
                week: 1,
                year: 1
              },
              events: {
                recent: [],
                pending: []
              },
              scandals: {
                active: [],
                resolved: []
              }
            };
          }

          /**
           * Initialize event listeners
           * @private
           */
          initializeEventListeners() {
            // Listen for UI events that affect game state
            this.eventSystem.on(EVENTS.POLICY_PROPOSED, event => {
              this.gameState.events.pending.push(event.data);
            });
            this.eventSystem.on(EVENTS.APPROVAL_CHANGE, event => {
              this.gameState.politics.approval = Math.max(0, Math.min(100, event.data.newApproval));
            });

            // Listen for economic events
            this.eventSystem.on('economic:update', event => {
              // Update game state with economic data
              const economicData = event.data;
              this.gameState.economy = {
                ...this.gameState.economy,
                ...economicData.metrics,
                sectors: economicData.sectors,
                cycle: economicData.cycle
              };
            });
            this.eventSystem.on('economic:event', event => {
              // Add economic events to game events
              this.gameState.events.recent.push({
                type: 'economic',
                ...event.data,
                timestamp: Date.now()
              });

              // Keep only last 10 events
              if (this.gameState.events.recent.length > 10) {
                this.gameState.events.recent = this.gameState.events.recent.slice(-10);
              }
            });
          }

          /**
           * Update FPS counter
           * @private
           */
          updateFPS(now) {
            this.frameCount += 1;
            if (now - this.lastFrameTime >= 1000) {
              this.fps = this.frameCount;
              this.frameCount = 0;
              this.lastFrameTime = now;
            }
          }

          /**
           * Calculate total playtime
           * @private
           */
          calculatePlaytime() {
            const start = new Date(this.gameState.time.startDate);
            const current = new Date(this.gameState.time.currentDate);
            return Math.floor((current - start) / (1000 * 60 * 60 * 24 * 7)); // weeks
          }

          /**
           * Deep merge objects
           * @private
           */
          mergeDeep(target, source) {
            const result = {
              ...target
            };
            Object.keys(source).forEach(key => {
              if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(result[key] || {}, source[key]);
              } else {
                result[key] = source[key];
              }
            });
            return result;
          }
        }

        // Create and export global game engine instance
        const gameEngine = exports("g", new GameEngine());
      }
    };
  });
})();
//# sourceMappingURL=core-legacy-oFe7g9uE.js.map
