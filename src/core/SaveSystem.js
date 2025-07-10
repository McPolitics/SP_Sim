/**
 * SaveSystem - Game save/load functionality using localStorage with compression
 * Handles game state persistence and recovery
 */
export class SaveSystem {
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
      const saveData = saves.find((save) => save.id === saveId);

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
      const filteredSaves = saves.filter((save) => save.id !== saveId);

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
      const saveData = saves.find((save) => save.id === saveId);

      if (!saveData) {
        console.error(`Save not found for export: ${saveId}`);
        return false;
      }

      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

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
        maxSaves: this.maxSaves,
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
      data: this.compressData(gameState),
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
    return (
      saveData
      && typeof saveData === 'object'
      && saveData.id
      && saveData.name
      && saveData.timestamp
      && saveData.data
    );
  }
}

// Create and export global save system instance
export const saveSystem = new SaveSystem();
