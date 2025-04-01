import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { resolve as _resolve, dirname, join } from 'path';
import { request } from 'https';
import { emitKeypressEvents } from 'readline';
const { stdout, stdin } = process;

// =============================================
// Конфигурация и настройки
// =============================================

// Настройки курсора
process.on('exit', () => stdout.write('\x1B[?25h')); //Обработчик включения курсора при выходе


// ANSI-коды для стилей текста и фона
const styles = {
  text: {
    reset: '\x1b[0m',
    underline: '\x1b[4m',
    bold: '\x1b[1m',
    
    // Цвета в RGB
    sky: '\x1b[38;2;135;206;235m',      //rgb(135, 206, 235)
    red: '\x1b[38;2;247;89;89m',        //rgb(247, 89, 89)
    green: '\x1b[38;2;0;255;0m',        //rgb(40, 207, 76)
    yellow: '\x1b[38;2;255;255;153m',   //rgb(255, 255, 153)
    white: '\x1b[38;2;255;255;255m',    //rgb(255, 255, 255)
    black: '\x1b[38;2;0;0;0m'           //rgb(0, 0, 0)
  }
};

// Константы для обработки клавиш
const KEY_EVENTS = {
  UP: 'up',
  DOWN: 'down',
  RETURN: 'return',
  ESCAPE: 'escape'
};

// Иконки
const ICO = {
  check: '🔎 ',
  save: '💾 ',
  update: '🔄 ',
  add: '➕ ',
  go_back: '↩ ',
  close: '❌ ',
  dependencies: '📦 ',
  dev_dependencies: '🔧 ',
  overrides: '⚙️ ',
  warning: '⚠️ ',
  success: '✅ ',
  error: '❌ '
};

// Меню
const MENU = {
  HOME: {
    CHECK_DEPENDENCIES: ICO.check + 'Проверить зависимости',
    UPDATE_DEPENDENCIES: ICO.update + 'Обновить зависимости',
    CREATE_BACKUP: ICO.save + 'Сделать резервную копию',
    EXIT: ICO.close + 'Закрыть PCV'
  },
  UPDATE: {
    DEPENDENCIES: ICO.dependencies + 'Обновить Dependencies',
    DEV_DEPENDENCIES: ICO.dev_dependencies + 'Обновить Dev Dependencies',
    OVERRIDES: ICO.overrides + 'Обновить Overrides',
    UPDATE_ALL: ICO.update + 'Обновить все зависимости',
    GO_BACK: ICO.go_back + 'Вернуться'
  },
  TABLE: {
    UPDATE_TABLE: ICO.update + 'Обновить всю таблицу',
    SELECT_DEPENDENCY: ICO.add + 'Выбрать зависимости',
    GO_BACK: ICO.go_back + 'Вернуться'
  }
};

// =============================================
// Классы для работы с данными
// =============================================

class PackageManager {
  constructor(filePath) {
    this.path = _resolve(filePath);
    this.data = this.load();
    this.backupDir = _resolve(dirname(this.path), 'pcv_backups');
  }

  load() {
    if (!existsSync(this.path)) {
      throw new Error(`Файл package.json не найден по пути: ${this.path}`);
    }
    return JSON.parse(readFileSync(this.path, 'utf-8'));
  }

  save() {
    const content = JSON.stringify(this.data, null, 2);
    writeFileSync(this.path, content);
    return content;
  }

  createBackup() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, `package_${timestamp}.json`);
    
    copyFileSync(this.path, backupPath);
    return backupPath;
  }

  getDependencies(type) {
    return this.data[type] || {};
  }

  updateDependencies(type, updates) {
    if (!this.data[type]) this.data[type] = {};
    Object.assign(this.data[type], updates);
    return this.save();
  }

  getAllDependencies() {
    return {
      ...this.data.dependencies,
      ...this.data.devDependencies,
      ...(this.data.overrides || {})
    };
  }
}

class VersionChecker {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 3600000; // 1 час
  }

  async fetchLatestVersion(packageName, retries = 3) {
    const cached = this.cache.get(packageName);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.version;
    }

    for (let i = 0; i < retries; i++) {
      try {
        const version = await this._fetchFromRegistry(packageName);
        this.cache.set(packageName, { version, timestamp: Date.now() });
        return version;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  _fetchFromRegistry(packageName) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'registry.npmjs.org',
        path: `/${packageName}/latest`,
        method: 'GET',
        timeout: 5000,
        headers: { 'User-Agent': 'PCV/1.0' }
      };

      const req = request(options, (res) => {
        if (res.statusCode === 404) {
          return reject(new Error(`Пакет "${packageName}" не найден`));
        }
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data).version);
          } catch (e) {
            reject(new Error('Неверный формат ответа'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Таймаут запроса'));
      });

      req.end();
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

// =============================================
// UI Компоненты
// =============================================

class UI {
  constructor() {
    this.selectedIndex = 0;
    this.menuStack = [];
    this.currentMenu = Object.values(MENU.HOME);
    this.packageManager = new PackageManager('./package.json');
    this.versionChecker = new VersionChecker();
    this.selectedDependencies = new Set();
    this.currentTable = null;
  }

  init() {
    this.setupKeypressHandling();
    this.render();
  }

  render() {
    this.clearConsoleHistory();
    stdout.write('\x1B[?25l');
    this.showLogo();
    this.renderMenu();
  }

  clearConsoleHistory() {
    console.clear();
    
    // For Unix-system (Linux, MacOS)
    if (process.platform !== 'win32') {
      process.stdout.write('\x1B[3J\x1B[H\x1B[2J');
    }
    
    if (process.stdout.isTTY) {
      process.stdout.write('\x1B[2J\x1B[3J\x1B[H\x1Bc');
    }
  }

  showLogo() {
    stdout.write(`
${styles.text.bold}${styles.text.sky}
  ██████╗  █████╗ ██╗   ██╗
  ██╔══██╗██╔══██╗██║░░░██║
  ██████╔╝██║░░╚═╝╚██╗░██╔╝
  ██╔═══╝░██║░░██╗░╚████╔╝░
  ██║░░░░░╚█████╔╝░░╚██╔╝░░  
  ╚═╝      ╚════╝    ╚═╝       
${styles.text.reset}
   ☁️ Created by: Furiozi.
            v2.0
\n`);
  }

  renderMenu() {
    this.currentMenu.forEach((item, index) => {
      if (index === this.selectedIndex) {
        stdout.write(`⮞ ${styles.text.sky}${styles.text.underline}${styles.text.bold}${item}${styles.text.reset}\n`);
      } else {
        stdout.write(`  ${item}\n`);
      }
    });
  }

  navigateToMenu(menu) {
    this.menuStack.push(this.currentMenu);
    this.currentMenu = menu;
    this.selectedIndex = 0;
    this.render();
  }

  goBack() {
    if (this.menuStack.length > 0) {
      this.currentMenu = this.menuStack.pop();
      this.selectedIndex = 0;
      this.render();
    }
  }

  exit() {
    this.clearConsoleHistory();
    stdout.write('\x1B[?25h'); // Включить курсор
    console.log('До свидания!');
    process.exit();
  }

  showSpinner(text = '') {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      stdout.write(`\r${frames[i]} ${text}`);
      i = (i + 1) % frames.length;
    }, 100);

    return {
      stop: (message = '') => {
        clearInterval(interval);
        stdout.write('\r\x1b[2K'); // Очистить строку
        if (message) console.log(message);
      }
    };
  }

  async showProgressBar(title, promise) {
    const width = 30;
    let progress = 0;
    
    const spinner = this.showSpinner(`${title} [${' '.repeat(width)}] 0%`);
    
    const interval = setInterval(() => {
      if (progress < 90) progress += 5;
      const filled = Math.round(width * progress / 100);
      spinner.stop();
      stdout.write(`\r⠋ ${title} [${'─'.repeat(filled)}${' '.repeat(width - filled)}] ${progress}%`);
    }, 300);

    try {
      const result = await promise;
      clearInterval(interval);
      spinner.stop(`\n${ICO.success} ${title}: Операция выполнена успешно!`);
      return result;
    } catch (error) {
      clearInterval(interval);
      spinner.stop(`${ICO.error} Ошибка: ${error.message}`);
      throw error;
    }
  }

  displayResults(versions) {
    // Ширина столбцов
    const colWidths = {
      name: 35,
      current: 12,
      latest: 12,
      status: 30
    };
  
    // Символы для рамок
    const border = {
      topLeft: '┌',
      top: '─',
      topMid: '┬',
      topRight: '┐',
      left: '│',
      mid: '│',
      right: '│',
      bottomLeft: '└',
      bottom: '─',
      bottomMid: '┴',
      bottomRight: '┘',
      hLine: '─',
      vLine: '│',
      cross: '├',
      middleCross: '┼',
      bottomCross: '┤'
    };
  
    // Функция для центрирования текста
    const centerText = (text, width) => {
      text = String(text);
      const pad = width - text.length;
      const padLeft = Math.floor(pad / 2);
      const padRight = pad - padLeft;
      return ' '.repeat(padLeft) + text + ' '.repeat(padRight);
    };
  
    
    // Function for table styles
    const getStatusStyle = (current, latest) => {
      const normalizeVersion = (v) => v.replace(/^[\^~]/, '');
      const normalizedCurrent = normalizeVersion(current);
      const normalizedLatest = normalizeVersion(latest);
    
      if (latest === 'недоступно') {
        return {
          textColor: styles.text.red,
          statusText: 'Недоступно'
        };
      } else if (normalizedLatest < normalizedCurrent) {
        return {
          textColor: styles.text.red,
          statusText: `Ошибка (${current} > ${latest})`
        };
      } else if (normalizedLatest === normalizedCurrent) {
        return {
          textColor: styles.text.sky,
          statusText: 'Актуальна'
        };
      } else {
        return {
          textColor: styles.text.yellow,
          statusText: `Устарела (${current} → ${latest})`
        };
      }
    };

    const drawTable = (title, data) => {
      if (Object.keys(data).length === 0) return;
  
      console.log(`\n${title}:\n`);
  
      // Верхняя граница таблицы
      let table = `${border.topLeft}${border.top.repeat(colWidths.name)}`;
      table += `${border.topMid}${border.top.repeat(colWidths.current)}`;
      table += `${border.topMid}${border.top.repeat(colWidths.latest)}`;
      table += `${border.topMid}${border.top.repeat(colWidths.status)}${border.topRight}\n`;
  
      // Заголовки столбцов
      table += `${border.left}${'Пакет'.padEnd(colWidths.name)}`;
      table += `${border.mid}${'Текущая'.padEnd(colWidths.current)}`;
      table += `${border.mid}${'Последняя'.padEnd(colWidths.latest)}`;
      table += `${border.mid}${centerText('Статус', colWidths.status)}${border.right}\n`;
  
      // Разделительная линия после заголовков
      table += `${border.cross}${border.hLine.repeat(colWidths.name)}`;
      table += `${border.middleCross}${border.hLine.repeat(colWidths.current)}`;
      table += `${border.middleCross}${border.hLine.repeat(colWidths.latest)}`;
      table += `${border.middleCross}${border.hLine.repeat(colWidths.status)}${border.bottomCross}\n`;
  
      // Данные
      Object.entries(data).forEach(([pkg, current]) => {
        const latest = versions[pkg];
        const { textColor, statusText } = getStatusStyle(current, latest);
  
        table += `${border.left}${textColor}${pkg.padEnd(colWidths.name)}`;
        table += `${border.mid}${current.padEnd(colWidths.current)}`;
        table += `${border.mid}${latest.padEnd(colWidths.latest)}`;
        table += `${border.mid}${centerText(statusText, colWidths.status)}${styles.text.reset}${border.right}\n`;
      });
  
      // Нижняя граница таблицы
      table += `${border.bottomLeft}${border.bottom.repeat(colWidths.name)}`;
      table += `${border.bottomMid}${border.bottom.repeat(colWidths.current)}`;
      table += `${border.bottomMid}${border.bottom.repeat(colWidths.latest)}`;
      table += `${border.bottomMid}${border.bottom.repeat(colWidths.status)}${border.bottomRight}\n`;
  
      console.log(table);
    };
  
    drawTable(`${ICO.dependencies} Dependencies`, this.packageManager.getDependencies('dependencies'));
    drawTable(`${ICO.dev_dependencies} Dev Dependencies`, this.packageManager.getDependencies('devDependencies'));
    drawTable(`${ICO.overrides} Overrides`, this.packageManager.getDependencies('overrides'));
  }
  
  async checkVersions() {
    try {
      const deps = this.packageManager.getAllDependencies();
      const packages = Object.keys(deps);
      
      if (packages.length === 0) {
        console.log('\n🕳  В проекте нет зависимостей.\n');
        return;
      }

      const versions = await this.showProgressBar(
        'Проверка версий',
        Promise.all(packages.map(async pkg => {
          try {
            return { [pkg]: await this.versionChecker.fetchLatestVersion(pkg) };
          } catch {
            return { [pkg]: 'недоступно' };
          }
        })).then(results => Object.assign({}, ...results))
      );

      this.displayResults(versions);
      console.log('\nНажмите любую клавишу для продолжения...');
    } catch (error) {
      console.error(`\n${ICO.error} Ошибка: ${error.message}`);
    }
  }

  async updateTable(tableName) {
    try {
      const current = this.packageManager.getDependencies(tableName);
      const packages = Object.keys(current);
      
      if (packages.length === 0) {
        console.log(`\n${ICO.warning} Таблица ${tableName} пуста.\n`);
        return;
      }

      const updates = await this.showProgressBar(
        `Обновление ${tableName}`,
        Promise.all(packages.map(async pkg => {
          try {
            return { [pkg]: await this.versionChecker.fetchLatestVersion(pkg) };
          } catch {
            return { [pkg]: current[pkg] }; // Оставляем текущую версию при ошибке
          }
        })).then(results => Object.assign({}, ...results))
      );

      this.packageManager.updateDependencies(tableName, updates);
      console.log(`\n${ICO.success} Таблица ${tableName} успешно обновлена!\n`);
    } catch (error) {
      console.error(`\n${ICO.error} Ошибка: ${error.message}`);
    } finally {
      this.goBack();
    }
  }

  async updateAll() {
    try {
      const allDeps = this.packageManager.getAllDependencies();
      const packages = Object.keys(allDeps);
      
      if (packages.length === 0) {
        console.log('\n🕳  В проекте нет зависимостей.\n');
        return;
      }

      const updates = await this.showProgressBar(
        'Обновление всех зависимостей',
        Promise.all(packages.map(async pkg => {
          try {
            return { [pkg]: await this.versionChecker.fetchLatestVersion(pkg) };
          } catch {
            return { [pkg]: allDeps[pkg] };
          }
        })).then(results => Object.assign({}, ...results))
      );

      // Обновляем только существующие таблицы
      if (this.packageManager.data.dependencies) {
        this.packageManager.updateDependencies('dependencies', updates);
      }
      if (this.packageManager.data.devDependencies) {
        this.packageManager.updateDependencies('devDependencies', updates);
      }
      if (this.packageManager.data.overrides) {
        this.packageManager.updateDependencies('overrides', updates);
      }

      console.log(`\n${ICO.success} Все зависимости успешно обновлены!\n`);
    } catch (error) {
      console.error(`\n${ICO.error} Ошибка: ${error.message}`);
    } finally {
      this.goBack();
    }
  }

  createBackup() {
    try {
      const backupPath = this.packageManager.createBackup();
      console.log(`\n${ICO.success} Резервная копия создана: ${backupPath}\n`);
    } catch (error) {
      console.error(`\n${ICO.error} Ошибка при создании резервной копии: ${error.message}\n`);
    }
  }

  // =============================================
  // Обработчики выбора меню
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
        this.confirmAction('Обновить ВСЕ зависимости?', () => this.updateAll());
        break;
        
      case MENU.UPDATE.GO_BACK:
        this.goBack();
        break;
        
      case MENU.TABLE.UPDATE_TABLE:
        this.confirmAction(`Обновить всю таблицу ${this.currentTable}?`, 
          () => this.updateTable(this.currentTable));
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
    const table = this.packageManager.getDependencies(this.currentTable);
    const packages = Object.keys(table);
    let currentIndex = 0;
    
    if (packages.length === 0) {
      console.log(`\n${ICO.warning} Таблица ${this.currentTable} пуста.\n`);
      return;
    }
    
    const render = () => {
      console.clear();
      console.log(`${ICO.add} Выберите зависимости для обновления (${this.currentTable}):\n`);
      
      packages.forEach((pkg, i) => {
        const prefix = i === currentIndex ? '⮞ ' : '  ';
        const selector = this.selectedDependencies.has(pkg) ? '◆' : '◇';
        console.log(`${prefix}${selector} ${pkg}`);
      });
      
      console.log('\nПробел: выбрать/снять  Enter: подтвердить  Esc: отмена');
    };
    
    const handleInput = (_, key) => {
      if (key.name === KEY_EVENTS.UP && currentIndex > 0) {
        currentIndex--;
      } else if (key.name === KEY_EVENTS.DOWN && currentIndex < packages.length - 1) {
        currentIndex++;
      } else if (key.name === 'space') {
        const pkg = packages[currentIndex];
        if (this.selectedDependencies.has(pkg)) {
          this.selectedDependencies.delete(pkg);
        } else {
          this.selectedDependencies.add(pkg);
        }
      } else if (key.name === KEY_EVENTS.RETURN) {
        if (this.selectedDependencies.size > 0) {
          this.confirmAction(
            `Обновить выбранные (${this.selectedDependencies.size}) зависимости?`,
            () => this.updateSelectedDependencies()
          );
          return;
        }
      } else if (key.name === KEY_EVENTS.ESCAPE) {
        this.selectedDependencies.clear();
        this.goBack();
        return;
      }
      
      render();
    };
    
    // Временная замена обработчика клавиш
    stdin.removeAllListeners('keypress');
    stdin.on('keypress', handleInput);
    
    render();
  }

  async updateSelectedDependencies() {
    if (this.selectedDependencies.size === 0) {
      console.log('\n🕳  Не выбрано ни одной зависимости.\n');
      return;
    }
    
    try {
      const updates = {};
      const packages = Array.from(this.selectedDependencies);
      
      await this.showProgressBar(
        'Обновление выбранных зависимостей',
        Promise.all(packages.map(async pkg => {
          try {
            updates[pkg] = await this.versionChecker.fetchLatestVersion(pkg);
          } catch {
            // Оставляем текущую версию при ошибке
            updates[pkg] = this.packageManager.getDependencies(this.currentTable)[pkg];
          }
        }))
      );
      
      this.packageManager.updateDependencies(this.currentTable, updates);
      this.selectedDependencies.clear();
      console.log(`\n${ICO.success} Выбранные зависимости успешно обновлены!\n`);
    } catch (error) {
      console.error(`\n${ICO.error} Ошибка: ${error.message}`);
    } finally {
      this.goBack();
    }
  }

  confirmAction(message, action) {
    console.log(`\n${ICO.warning} ${message} (y/n)`);
    
    const handleInput = (_, key) => {
      if (key.name === 'y') {
        stdin.removeAllListeners('keypress');
        this.setupKeypressHandling();
        action();
      } else if (key.name === 'n' || key.name === KEY_EVENTS.ESCAPE) {
        stdin.removeAllListeners('keypress');
        this.setupKeypressHandling();
        this.render();
      }
    };
    
    // Временная замена обработчика клавиш
    stdin.removeAllListeners('keypress');
    stdin.on('keypress', handleInput);
  }

  // =============================================
  // Обработка ввода
  // =============================================

  setupKeypressHandling() {
    emitKeypressEvents(stdin);
    if (stdin.isTTY) stdin.setRawMode(true);
    
    stdin.removeAllListeners('keypress');
    stdin.on('keypress', (_, key) => {
      if (key.ctrl && key.name === 'c') {
        this.exit();
      } else {
        this.handleInput(key);
      }
    });
  }

  handleInput(key) {
    if (key.name === KEY_EVENTS.UP && this.selectedIndex > 0) {
      this.selectedIndex--;
    } else if (key.name === KEY_EVENTS.DOWN && this.selectedIndex < this.currentMenu.length - 1) {
      this.selectedIndex++;
    } else if (key.name === KEY_EVENTS.RETURN) {
      this.handleSelection(this.currentMenu[this.selectedIndex]);
      return;
    }
    
    this.render();
  }
}

// =============================================
// Запуск приложения
// =============================================

// Обработчик очистки консоли
process.on('exit', () => {
  stdout.write('\x1B[?25h');
  new UI().clearConsoleHistory();
});

process.on('SIGINT', () => {
  new UI().clearConsoleHistory();
  process.exit();
});

process.on('uncaughtException', (err) => {
  new UI().clearConsoleHistory();
  console.error(`${ICO.error} Необработанная ошибка: ${err.message}`);
  process.exit(1);
});

// Запуск приложения
try {
  const ui = new UI();
  ui.init();
} catch (error) {
  console.error(`${ICO.error} ${error.message}`);
  process.exit(1);
}