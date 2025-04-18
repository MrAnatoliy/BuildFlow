#!/usr/bin/env node
//
//
// Dependency Version Patrol (DVP)
// Copyright 2025 Furiozi
// Licensed under the Apache License, Version 2.0
// @see https://github.com/Furiozi/DVP
//
//
//
// =============================================
// Imports (Type CommonJS)
// =============================================

const { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } = require('fs');
const { resolve: pathResolve, dirname, join } = require('path');
const { request } = require('https');
const { emitKeypressEvents } = require('readline');

// =============================================
// Imports (Type Module)
// =============================================

//import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
//import { resolve as pathResolve, dirname, join } from 'path';
//import { request } from 'https';
//import { emitKeypressEvents } from 'readline';

const { stdout, stdin } = process;

// =============================================
// Configuration constants
// =============================================

const CONFIG = {
  CACHE_TTL: 300000, // 5 min in ms
  REQUEST_TIMEOUT: 5000, // 5 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second base delay
  PROGRESS_BAR_WIDTH: 30,
  SPINNER_FRAMES: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  SPINNER_INTERVAL: 100,
  PROGRESS_INTERVAL: 300,
  BACKUP_DIR: 'DVP_backups',
  TABLE_COLUMNS: {
    name: 35,
    current: 12,
    latest: 12,
    status: 30
  }
};

// =============================================
// Styles and icons
// =============================================

const STYLES = {
  reset: '\x1b[0m',
  underline: '\x1b[4m',
  bold: '\x1b[1m',
  colors: {
    sky: '\x1b[38;2;135;206;235m',
    red: '\x1b[38;2;247;89;89m',
    green: '\x1b[38;2;0;255;0m',
    yellow: '\x1b[38;2;255;255;153m',
    white: '\x1b[38;2;255;255;255m',
    black: '\x1b[38;2;0;0;0m'
  }
};

const ICONS = {
  check: '🔎 ',
  save: '💾 ',
  update: '🔄 ',
  add: '➕ ',
  goBack: '↩ ',
  close: '❌ ',
  table: '📊 ',
  folder: '📁  ',
  dependencies: '📦 ',
  devDependencies: '🔧 ',
  overrides: '⚙️ ',
  warning: '⚠️ ',
  success: '✅ ',
  error: '❌ ',
  empty: '🕳 '
};

const TABLE_ICONS = {
  dependencies: ICONS.dependencies,
  devDependencies: ICONS.devDependencies,
  overrides: ICONS.overrides
};

// =============================================
// Keys and Events
// =============================================

const KEYS = {
  UP: 'up',
  DOWN: 'down',
  RETURN: 'return',
  ESCAPE: 'escape',
  SPACE: 'space',
  CTRL_C: 'c'
};

// =============================================
// Menu and Navigation
// =============================================

const MENU = {
  HOME: {
    CHECK_DEPENDENCIES: `${ICONS.check}Check dependencies`,
    UPDATE_DEPENDENCIES: `${ICONS.update}Update dependencies`,
    CREATE_BACKUP: `${ICONS.save}Create backup`,
    EXIT: `${ICONS.close}Exit DVP\n`
  },
  UPDATE: {
    DEPENDENCIES: `${ICONS.dependencies}Update Dependencies`,
    DEV_DEPENDENCIES: `${ICONS.devDependencies}Update Dev Dependencies`,
    OVERRIDES: `${ICONS.overrides}Update Overrides`,
    UPDATE_ALL: `${ICONS.update}Update all dependencies - ${ICONS.warning} Bug!`,
    GO_BACK: `${ICONS.goBack}Go back`
  },
  TABLE: {
    UPDATE_TABLE: `${ICONS.update}Update entire table`,
    SELECT_DEPENDENCY: `${ICONS.add}Select dependencies`,
    GO_BACK: `${ICONS.goBack}Go back\n`
  }
};

// =============================================
// Class for working with package.json
// =============================================
class PackageManager {
  constructor(filePath = './package.json') {
    this.path = pathResolve(filePath);
    this.backupDir = pathResolve(dirname(this.path), CONFIG.BACKUP_DIR);
    this.data = this.load();
  }

  load() {
    if (!existsSync(this.path)) {
      throw new Error(`package.json file not found at path: ${this.path}`);
    }
    
    try {
      return JSON.parse(readFileSync(this.path, 'utf-8'));
    } catch (error) {
      throw new Error(`Error reading package.json: ${error.message}`);
    }
  }

  save() {
    try {
      const content = JSON.stringify(this.data, null, 2);
      writeFileSync(this.path, content, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Error saving package.json: ${error.message}`);
    }
  }

  createBackup() {
    try {
      if (!existsSync(this.backupDir)) {
        mkdirSync(this.backupDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);
      
      const backupPath = join(this.backupDir, `package_${timestamp}.json`);
      copyFileSync(this.path, backupPath);
      
      return backupPath;
    } catch (error) {
      throw new Error(`Error creating backup: ${error.message}`);
    }
  }

  getDependencies(type) {
    return this.data[type] || {};
  }

  updateDependencies(type, updates) {
    if (!this.data[type]) {
      this.data[type] = {};
    }
    
    try {
      Object.assign(this.data[type], updates);
      return this.save();
    } catch (error) {
      throw new Error(`Error updating dependencies: ${error.message}`);
    }
  }

  getAllDependencies() {
    return {
      ...(this.data.dependencies || {}),
      ...(this.data.devDependencies || {}),
      ...(this.data.overrides || {})
    };
  }
}

// =============================================
// Class for checking versions
// =============================================

class VersionChecker {
  constructor() {
    this.cache = new Map();
  }

  async getLatestVersion(packageName) {
    const cached = this.cache.get(packageName);
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
      return cached.version;
    }

    for (let attempt = 0; attempt < CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        const version = await this.fetchVersion(packageName);
        this.cache.set(packageName, { version, timestamp: Date.now() });
        return version;
      } catch (error) {
        if (attempt === CONFIG.RETRY_ATTEMPTS - 1) {
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, CONFIG.RETRY_DELAY_BASE * (attempt + 1))
        );
      }
    }
  }

  async fetchVersion(packageName) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'registry.npmjs.org',
        path: `/${encodeURIComponent(packageName)}/latest`,
        method: 'GET',
        timeout: CONFIG.REQUEST_TIMEOUT,
        headers: { 'User-Agent': 'DependencyVersionPatrol/1.0' }
      };

      const req = request(options, (res) => {
        if (res.statusCode === 404) {
          return reject(new Error(`Package "${packageName}" not found`));
        }
        
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response.version);
          } catch (error) {
            reject(new Error('Invalid response format from npm registry'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout to npm registry'));
      });

      req.end();
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// =============================================
// Helper functions
// =============================================

class Helpers {
  static normalizeVersion(version) {
    if (typeof version !== 'string') return '0.0.0';
    return version.replace(/^[\^~]/, '').split('-')[0];
  }

  static compareVersions(current, latest) {
    if (latest === 'unavailable') {
      return { color: STYLES.colors.red, status: 'Unavailable' };
    }
    
    try {
      const curr = Helpers.normalizeVersion(current);
      const lat = Helpers.normalizeVersion(latest);
      
      if (lat < curr) {
        return { 
          color: STYLES.colors.red, 
          status: `error (${current} > ${latest})` 
        };
      } else if (lat === curr) {
        return { 
          color: STYLES.colors.sky, 
          status: 'latest' 
        };
      } else {
        return { 
          color: STYLES.colors.yellow, 
          status: `refresh (${current} → ${latest})` 
        };
      }
    } catch {
      return { 
        color: STYLES.colors.red, 
        status: 'Comparison error' 
      };
    }
  }

  static centerText(text, width) {
    if (!text || !width) return '';
    
    text = String(text);
    const pad = Math.max(0, width - text.length);
    const padLeft = Math.floor(pad / 2);
    const padRight = pad - padLeft;
    
    return ' '.repeat(padLeft) + text + ' '.repeat(padRight);
  }

  static drawTable(title, data, versions) {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return '';
    }

    const { name, current, latest, status } = CONFIG.TABLE_COLUMNS;
    const border = {
      topLeft: '┌', top: '─', topMid: '┬', topRight: '┐',
      left: '│', mid: '│', right: '│',
      bottomLeft: '└', bottom: '─', bottomMid: '┴', bottomRight: '┘',
      hLine: '─', vLine: '│', cross: '├', middleCross: '┼', bottomCross: '┤'
    };

    // Top table border
    let table = `${border.topLeft}${border.top.repeat(name)}`;
    table += `${border.topMid}${border.top.repeat(current)}`;
    table += `${border.topMid}${border.top.repeat(latest)}`;
    table += `${border.topMid}${border.top.repeat(status)}${border.topRight}\n`;

    // Column headers
    table += `${border.left}${'Package'.padEnd(name)}`;
    table += `${border.mid}${'Current'.padEnd(current)}`;
    table += `${border.mid}${'Latest'.padEnd(latest)}`;
    table += `${border.mid}${Helpers.centerText('Status', status)}${border.right}\n`;

    // Divider line
    table += `${border.cross}${border.hLine.repeat(name)}`;
    table += `${border.middleCross}${border.hLine.repeat(current)}`;
    table += `${border.middleCross}${border.hLine.repeat(latest)}`;
    table += `${border.middleCross}${border.hLine.repeat(status)}${border.bottomCross}\n`;

    // Data
    for (const [pkg, currVersion] of Object.entries(data)) {
      const latestVersion = versions[pkg] || 'unavailable';
      const { color, status: statusText } = Helpers.compareVersions(currVersion, latestVersion);

      table += `${border.left}${color}${pkg.padEnd(name)}`;
      table += `${border.mid}${currVersion.padEnd(current)}`;
      table += `${border.mid}${latestVersion.padEnd(latest)}`;
      table += `${border.mid}${Helpers.centerText(statusText, status)}${STYLES.reset}${border.right}\n`;
    }

    // Bottom table border
    table += `${border.bottomLeft}${border.bottom.repeat(name)}`;
    table += `${border.bottomMid}${border.bottom.repeat(current)}`;
    table += `${border.bottomMid}${border.bottom.repeat(latest)}`;
    table += `${border.bottomMid}${border.bottom.repeat(status)}${border.bottomRight}`;

    return table;
  }
}

// =============================================
// Main UI class
// =============================================

class DependencyVersionPatrolUI {
  constructor() {
    this.selectedIndex = 0;
    this.menuStack = [];
    this.currentMenu = Object.values(MENU.HOME);
    this.packageManager = new PackageManager();
    this.versionChecker = new VersionChecker();
    this.selectedDependencies = new Set();
    this.currentTable = null;
  }

  init() {
    this.setupKeypressHandling();
    this.clearConsole();
    this.showLogo();
    this.renderMenu();
  }

  clearConsole() {
    try {
      console.clear();
      
      // For Unix systems (Linux, MacOS)
      if (process.platform !== 'win32') {
        process.stdout.write('\x1B[3J\x1B[H\x1B[2J');
      }
      
      // For terminals supporting ANSI escape codes
      if (process.stdout.isTTY) {
        process.stdout.write('\x1B[2J\x1B[3J\x1B[H\x1Bc');
      }
      
      // Hide cursor
      stdout.write('\x1B[?25l');
    } catch (error) {
      console.error(`${ICONS.error} Console clear error: ${error.message}`);
    }
  }

  showLogo() {
    stdout.write(`
${STYLES.bold}${STYLES.colors.sky}
      ██████╗ ██╗   ██╗██████╗
      ██╔══██╗██║░░░██║██╔══██╗
      ██║░░██║╚██╗░██╔╝██████╔╝
      ██║░░██║░╚████╔╝░██╔═══╝░
      ██████╔╝░░╚██╔╝░░██║░░░░
      ╚═════╝░░░░╚═╝░░░╚═╝░░
${STYLES.reset}
  📝 Dependency Version Patrol v1.0\n
   https://github.com/Furiozi/DVP\n
        Created by: Furiozi
\n\n`);
  }

  renderMenu() {
    try {
      this.currentMenu.forEach((item, index) => {
        const isSelected = index === this.selectedIndex;
        const style = isSelected 
          ? `${STYLES.colors.sky}${STYLES.underline}${STYLES.bold}` 
          : '';
        stdout.write(`${isSelected ? '⮞ ' : '  '}${style}${item}${STYLES.reset}\n`);
        //stdout.write(`${isSelected ? '- ' : '  '}${style}${item}${STYLES.reset}\n`); // Select this if you're using standard CMD. And Replace str 758,50
      });
    } catch (error) {
      console.error(`${ICONS.error} Menu render error: ${error.message}`);
    }
  }

  navigateToMenu(menu) {
    this.menuStack.push(this.currentMenu);
    this.currentMenu = menu;
    this.selectedIndex = 0;
    this.clearConsole();
    this.showLogo();
    this.renderMenu();
  }

  goBack() {
    if (this.menuStack.length > 0) {
      this.currentMenu = this.menuStack.pop();
      this.selectedIndex = 0;
      this.clearConsole();
      this.showLogo();
      this.renderMenu();
    }
  }

  exit() {
    this.clearConsole();
    stdout.write('\x1B[?25h'); // Show cursor
    this.showLogo()
    console.log(`\nHappy Hacking! :)\n`);
    console.log(`Don't forget to run ${STYLES.bold}${STYLES.colors.yellow}npm install ${STYLES.reset}after updating.\n`);
    console.log(`${STYLES.colors.sky}Automatic download will be available in future updates.${STYLES.reset}\n\n`);
    process.exit(0);
  }

  async showProgress(title, promise) {
    let progress = 0;
    let frameIndex = 0;
    
    const spinner = setInterval(() => {
      if (progress < 90) progress += 5;
      
      const filled = Math.round(CONFIG.PROGRESS_BAR_WIDTH * progress / 100);
      const progressBar = `[${'─'.repeat(filled)}${' '.repeat(CONFIG.PROGRESS_BAR_WIDTH - filled)}]`;
      
      stdout.write(
        `\r${CONFIG.SPINNER_FRAMES[frameIndex]} ${title} ${progressBar} ${progress}%`
      );
      
      frameIndex = (frameIndex + 1) % CONFIG.SPINNER_FRAMES.length;
    }, CONFIG.SPINNER_INTERVAL);

    try {
      const result = await promise;
      clearInterval(spinner);
      stdout.write('\r\x1b[2K'); // Clear line
      console.log(`${ICONS.success} ${title}: Operation completed successfully!`);
      return result;
    } catch (error) {
      clearInterval(spinner);
      stdout.write('\r\x1b[2K');
      console.error(`${ICONS.error} ${title}: Error - ${error.message}`);
      throw error;
    }
  }

  async checkVersions() {
    try {
      const deps = this.packageManager.getAllDependencies();
      const packages = Object.keys(deps);
      
      if (packages.length === 0) {
        console.log(`\n${ICONS.empty} No dependencies in project.\n`);
        return;
      }

      const versions = await this.showProgress(
        'Checking package versions',
        Promise.all(
          packages.map(async pkg => {
            try {
              return { 
                [pkg]: await this.versionChecker.getLatestVersion(pkg) 
              };
            } catch {
              return { [pkg]: 'unavailable' };
            }
          })
        ).then(results => Object.assign({}, ...results))
      );

      this.displayVersionResults(versions);
      console.log('\nPress any key to continue...');
    } catch (error) {
      console.error(`\n${ICONS.error} Version check error: ${error.message}`);
    }
  }

  displayVersionResults(versions) {
    try {
      console.log(`\n${ICONS.table} Version check results:\n`);
      
      const tables = [
        { title: `${ICONS.dependencies} Dependencies`, type: 'dependencies' },
        { title: `${ICONS.devDependencies} Dev Dependencies`, type: 'devDependencies' },
        { title: `${ICONS.overrides} Overrides`, type: 'overrides' }
      ];

      let hasData = false;
      
      for (const { title, type } of tables) {
        const data = this.packageManager.getDependencies(type);
        if (Object.keys(data).length > 0) {
          console.log(title);
          console.log(Helpers.drawTable(title, data, versions) + '\n');
          hasData = true;
        }
      }

      if (!hasData) {
        console.log(`${ICONS.empty} No data to display\n`);
      }
    } catch (error) {
      console.error(`\n${ICONS.error} Results display error: ${error.message}`);
    }
  }

  async updateDependenciesTable(tableName) {
    try {
      const current = this.packageManager.getDependencies(tableName);
      const packages = Object.keys(current);
      
      if (packages.length === 0) {
        console.log(`${ICONS.empty} Table ${tableName} is empty.\n`);
        return;
      }

      const updates = await this.showProgress(
        `Updating ${tableName}`,
        Promise.all(
          packages.map(async pkg => {
            try {
              return { 
                [pkg]: await this.versionChecker.getLatestVersion(pkg) 
              };
            } catch {
              return { [pkg]: current[pkg] }; // Keep current version on error
            }
          })
        ).then(results => Object.assign({}, ...results))
      );

      this.packageManager.updateDependencies(tableName, updates);
      console.log(`\n${TABLE_ICONS[tableName]} Table ${tableName} updated successfully!\n`);
    } catch (error) {
      console.error(`\n${ICONS.error} Table update error: ${error.message}`);
    }
  }

  async updateAllDependencies() {
    try {
      const allDeps = this.packageManager.getAllDependencies();
      const packages = Object.keys(allDeps);
      
      if (packages.length === 0) {
        console.log(`\n${ICONS.empty} No dependencies in project.\n`);
        return;
      }

      const updates = await this.showProgress(
        'Updating all dependencies',
        Promise.all(
          packages.map(async pkg => {
            try {
              return { 
                [pkg]: await this.versionChecker.getLatestVersion(pkg) 
              };
            } catch {
              return { [pkg]: allDeps[pkg] };
            }
          })
        ).then(results => Object.assign({}, ...results))
      );

      // Update only existing tables
      if (this.packageManager.data.dependencies) {
        this.packageManager.updateDependencies('dependencies', updates);
      }
      if (this.packageManager.data.devDependencies) {
        this.packageManager.updateDependencies('devDependencies', updates);
      }
      if (this.packageManager.data.overrides) {
        this.packageManager.updateDependencies('overrides', updates);
      }

      console.log(`\n${ICONS.success} All dependencies updated successfully!\n`);
    } catch (error) {
      console.error(`\n${ICONS.error} Dependencies update error: ${error.message}`);
    }
  }

  createBackup() {
    try {
      const backupPath = this.packageManager.createBackup();
      console.log(`\n${ICONS.success} Backup created:\n\n${ICONS.folder}${backupPath}`);
    } catch (error) {
      console.error(`\n${ICONS.error} Backup creation error: ${error.message}\n`);
    }
  }

  // =============================================
  // Menu selection handlers
  // =============================================

  handleSelection(selectedItem) {
    const menuValues = Object.values;
    
    switch (selectedItem) {
      case MENU.HOME.CHECK_DEPENDENCIES:
        this.checkVersions();
        break;
        
      case MENU.HOME.UPDATE_DEPENDENCIES:
        this.navigateToMenu(menuValues(MENU.UPDATE));
        break;
        
      case MENU.HOME.CREATE_BACKUP:
        this.createBackup();
        break;
        
      case MENU.HOME.EXIT:
        this.exit();
        break;
        
      case MENU.UPDATE.DEPENDENCIES:
        this.currentTable = 'dependencies';
        this.navigateToMenu(menuValues(MENU.TABLE));
        break;
        
      case MENU.UPDATE.DEV_DEPENDENCIES:
        this.currentTable = 'devDependencies';
        this.navigateToMenu(menuValues(MENU.TABLE));
        break;
        
      case MENU.UPDATE.OVERRIDES:
        this.currentTable = 'overrides';
        this.navigateToMenu(menuValues(MENU.TABLE));
        break;
        
      case MENU.UPDATE.UPDATE_ALL:
        this.confirmAction(
          'Are you sure you want to update ALL dependencies?',
          () => this.updateAllDependencies()
        );
        break;
        
      case MENU.UPDATE.GO_BACK:
        this.goBack();
        break;
        
      case MENU.TABLE.UPDATE_TABLE:
        this.confirmAction(
          `Update entire ${this.currentTable} table?`, 
          () => this.updateDependenciesTable(this.currentTable)
        );
        break;
        
      case MENU.TABLE.SELECT_DEPENDENCY:
        this.selectDependencies();
        break;
        
      case MENU.TABLE.GO_BACK:
        this.goBack();
        break;
    }
  }

  selectDependencies() {
    try {
      const table = this.packageManager.getDependencies(this.currentTable);
      const packages = Object.keys(table);
      let currentIndex = 0;
      
      if (packages.length === 0) {
        console.log(`${ICONS.empty} Table ${this.currentTable} is empty.`);
        return;
      }
  
      // Show loading indicator
      const spinner = this.showSpinner('Loading version information...');
      
      // Get latest versions for all dependencies
      const getVersions = async () => {
        const versions = {};
        for (const pkg of packages) {
          try {
            versions[pkg] = {
              current: table[pkg],
              latest: await this.versionChecker.getLatestVersion(pkg)
            };
          } catch {
            versions[pkg] = {
              current: table[pkg],
              latest: 'unavailable'
            };
          }
        }
        return versions;
      };
  
      // Render list with versions
      const renderSelection = (versions) => {
        this.clearConsole();
        console.log(`${ICONS.add} Select dependencies to update (${this.currentTable}):\n`);
        
        const maxNameLength = Math.max(...packages.map(pkg => pkg.length), 20);
        
        packages.forEach((pkg, i) => {
          const prefix = i === currentIndex ? '⮞ ' : '  ';
          //const prefix = i === currentIndex ? '- ' : '  '; // Select this if you're using standard CMD. And Replace str 442,38
          const selector = this.selectedDependencies.has(pkg) ? '◆' : '◇';
          //const selector = this.selectedDependencies.has(pkg) ? '[+]' : '[ ]'; // Select this if u're using standart CMD
          const versionInfo = versions[pkg];
          
          // Format versions
          const currentVer = versionInfo.current.padEnd(12);
          const latestVer = versionInfo.latest.padEnd(12);
          
          // Style based on status
          const { color } = Helpers.compareVersions(versionInfo.current, versionInfo.latest);
          
          console.log(
            `${prefix}${selector} ${pkg.padEnd(maxNameLength)} ` +
            `${color}${currentVer} → ${latestVer}${STYLES.reset}`
          );
        });
        
        console.log('\nSpace: select/unselect  Enter: confirm  Esc: cancel');
      };
  
      // Load versions and render list
      getVersions().then(versions => {
        spinner.stop();
        let currentVersions = versions;
        
        const handleSelectionInput = (_, key) => {
          if (key.name === KEYS.UP && currentIndex > 0) {
            currentIndex--;
          } else if (key.name === KEYS.DOWN && currentIndex < packages.length - 1) {
            currentIndex++;
          } else if (key.name === KEYS.SPACE) {
            const pkg = packages[currentIndex];
            this.selectedDependencies.has(pkg) 
              ? this.selectedDependencies.delete(pkg) 
              : this.selectedDependencies.add(pkg);
          } else if (key.name === KEYS.RETURN) {
            if (this.selectedDependencies.size > 0) {
              this.confirmAction(
                `Update selected (${this.selectedDependencies.size}) dependencies?`,
                () => this.updateSelectedDependencies()
              );
              return;
            }
          } else if (key.name === KEYS.ESCAPE) {
            this.selectedDependencies.clear();
            stdin.removeAllListeners('keypress');
            this.setupKeypressHandling();
            this.goBack();
            return;
          } 
          renderSelection(currentVersions);
        };
        
        // Temporary key handler replacement
        stdin.removeAllListeners('keypress');
        stdin.on('keypress', handleSelectionInput);
        
        renderSelection(currentVersions);
      }).catch(error => {
        spinner.stop();
        console.error(`\n${ICONS.error} Version load error: ${error.message}`);
      });
    } catch (error) {
      console.error(`\n${ICONS.error} Dependency selection error: ${error.message}`);
    }
  }
  
  // Add showSpinner method to UI class
  showSpinner(text = '') {
    let i = 0;
    const frames = CONFIG.SPINNER_FRAMES;
    
    // Clear line and show spinner
    stdout.write('\x1B[?25l'); // Hide cursor
    const interval = setInterval(() => {
      stdout.write(`\r${frames[i]} ${text}`);
      i = (i + 1) % frames.length;
    }, CONFIG.SPINNER_INTERVAL);
  
    return {
      stop: (message = '') => {
        clearInterval(interval);
        stdout.write('\r\x1B[2K'); // Clear line
        if (message) console.log(message);
        stdout.write('\x1B[?25h'); // Show cursor
      }
    };
  }

  async updateSelectedDependencies() {
    try {
      if (this.selectedDependencies.size === 0) {
        console.log(`\n${ICONS.empty} No dependencies selected.\n`);
        return;
      }
      const updates = {};
      const packages = Array.from(this.selectedDependencies);
      
      await this.showProgress(
        'Updating selected dependencies',
        Promise.all(
          packages.map(async pkg => {
            try {
              updates[pkg] = await this.versionChecker.getLatestVersion(pkg);
            } catch {
              // Keep current version on error
              updates[pkg] = this.packageManager.getDependencies(this.currentTable)[pkg];
            }
          })
        )
      );    
      this.packageManager.updateDependencies(this.currentTable, updates);
      this.selectedDependencies.clear();
      console.log(`\n${ICONS.success} Selected dependencies updated successfully!\n`);
      console.log('\nPress any key to continue...');
    } catch (error) {
      console.error(`\n${ICONS.error} Update error: ${error.message}`);
    }
  } 

  confirmAction(message, action) {
    try {
      console.log(`\n${ICONS.warning} ${message} (y/n)\n`);
      
      const handleConfirmation = (_, key) => {
        if (key.name === 'y') {
          stdin.removeAllListeners('keypress');
          this.setupKeypressHandling();
          action();
        } else if (key.name === 'n' || key.name === KEYS.ESCAPE) {
          stdin.removeAllListeners('keypress');
          this.setupKeypressHandling();
          this.goBack();
        }
      };
      stdin.removeAllListeners('keypress');
      stdin.on('keypress', handleConfirmation);
    } catch (error) {
      console.error(`\n${ICONS.error} Confirmation error: ${error.message}`);
    }
  }

  // =============================================
  // Input handling
  // =============================================

  setupKeypressHandling() {
    try {
      emitKeypressEvents(stdin);
      
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }
      
      stdin.removeAllListeners('keypress');
      stdin.on('keypress', (_, key) => {
        if (key.ctrl && key.name === KEYS.CTRL_C) {
          this.exit();
        } else {
          this.handleInput(key);
        }
      });
    } catch (error) {
      console.error(`${ICONS.error} Key handling setup error: ${error.message}`);
      process.exit(1);
    }
  }

  handleInput(key) {
    try {
      if (key.name === KEYS.UP && this.selectedIndex > 0) {
        this.selectedIndex--;
      } else if (key.name === KEYS.DOWN && this.selectedIndex < this.currentMenu.length - 1) {
        this.selectedIndex++;
      } else if (key.name === KEYS.RETURN) {
        this.handleSelection(this.currentMenu[this.selectedIndex]);
        return;
      }
      this.clearConsole();
      this.showLogo();
      this.renderMenu();
    } catch (error) {
      console.error(`${ICONS.error} Input handling error: ${error.message}`);
    }
  }
}

// =============================================
// Process handlers
// =============================================

process.on('exit', () => {
  stdout.write('\x1B[?25h'); // Show cursor on exit
});

process.on('SIGINT', () => {
  new DependencyVersionPatrolUI().clearConsole();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  new DependencyVersionPatrolUI().clearConsole();
  console.error(`${ICONS.error} Unhandled error: ${error.message}`);
  process.exit(1);
});

// =============================================
// Application launch
// =============================================

(function main() {
  try {
    const ui = new DependencyVersionPatrolUI();
    ui.init();
  } catch (error) {
    console.error(`${ICONS.error} ${error.message}`);
    process.exit(1);
  }
})();