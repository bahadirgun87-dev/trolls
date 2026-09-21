const { app, BrowserWindow, Tray, Menu, Notification, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';

class VoiceApp {
    constructor() {
        this.mainWindow = null;
        this.tray = null;
        this.signalingServer = null;
        this.isQuitting = false;
        this.setupApp();
    }

    setupApp() {
        app.whenReady().then(this.onReady.bind(this));
        app.on('window-all-closed', this.onWindowAllClosed.bind(this));
        app.on('activate', this.onActivate.bind(this));
        app.on('before-quit', this.onBeforeQuit.bind(this));
        autoUpdater.checkForUpdatesAndNotify();
    }

    onReady() {
        this.createMainWindow();
        this.createTray();
        this.setupIPCListeners();
        this.setupMenu();
    }

    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false
            },
            icon: path.join(__dirname, 'assets', 'icon.png'),
            title: 'Voice Communication App',
            show: false
        });

        // Load the application
        if (process.env.ELECTRON_START_URL) {
            // Development mode - load from Vite dev server
            this.mainWindow.loadURL(process.env.ELECTRON_START_URL);
        } else {
            // Production mode - load from built files
            this.mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'client/dist/index.html'),
                protocol: 'file:',
                slashes: true
            }));
        }

        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.on('unresponsive', () => {
            log.warn('Main window became unresponsive');
            this.showNotification('Warning', 'Application is not responding');
        });
    }

    createTray() {
        const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
        this.tray = new Tray(iconPath);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show App',
                click: () => this.showMainWindow()
            },
            {
                label: 'Hide',
                click: () => this.hideMainWindow()
            },
            { type: 'separator' },
            {
                label: 'Exit',
                click: () => this.quitApp()
            }
        ]);

        this.tray.setToolTip('Voice Communication App');
        this.tray.setContextMenu(contextMenu);

        this.tray.on('click', () => this.showMainWindow());
    }

    setupIPCListeners() {
        // Handle window control messages
        ipcMain.on('window:minimize', () => {
            this.mainWindow.minimize();
        });

        ipcMain.on('window:maximize', () => {
            if (this.mainWindow.isMaximized()) {
                this.mainWindow.unmaximize();
            } else {
                this.mainWindow.maximize();
            }
        });

        ipcMain.on('window:close', () => {
            this.hideMainWindow();
        });

        // Handle notifications
        ipcMain.on('show-notification', (event, title, body) => {
            this.showNotification(title, body);
        });

        // Handle audio device changes
        ipcMain.on('audio-devices-changed', () => {
            this.mainWindow.webContents.send('refresh-audio-devices');
        });

        // Handle app updates
        autoUpdater.on('update-available', () => {
            this.showNotification('Update Available', 'A new version is available. Downloading...');
        });

        autoUpdater.on('update-downloaded', () => {
            this.showNotification('Update Ready', 'The application will restart to install the update.');
            setTimeout(() => autoUpdater.quitAndInstall(), 5000);
        });
    }

    setupMenu() {
        const template = [
            {
                label: 'Application',
                submenu: [
                    {
                        label: 'About',
                        click: () => this.showAboutDialog()
                    },
                    { type: 'separator' },
                    {
                        label: 'Hide',
                        accelerator: 'CmdOrCtrl+H',
                        click: () => this.hideMainWindow()
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'CmdOrCtrl+Shift+H',
                        click: () => app.hideOtherWindows()
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: 'CmdOrCtrl+Q',
                        click: () => this.quitApp()
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'selectAll' }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    showNotification(title, body) {
        new Notification({ title, body }).show();
    }

    showAboutDialog() {
        const { dialog } = require('electron');
        dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About Voice Communication App',
            message: 'Voice Communication App',
            detail: 'Version 1.0.0\nA Discord-like voice communication application\n© 2026 Voice Comm Inc.',
            buttons: ['OK']
        });
    }

    // Window management methods
    showMainWindow() {
        this.mainWindow.show();
        this.mainWindow.focus();
    }

    hideMainWindow() {
        this.mainWindow.hide();
    }

    onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            this.quitApp();
        }
    }

    onActivate() {
        if (BrowserWindow.getAllWindows().length === 0) {
            this.createMainWindow();
        } else {
            this.showMainWindow();
        }
    }

    onBeforeQuit() {
        this.isQuitting = true;
    }

    quitApp() {
        this.isQuitting = true;
        autoUpdater.quitAndInstall();
        app.quit();
    }

    // Signaling server management
    async connectToSignalingServer(serverUrl, token) {
        try {
            // Implementation would depend on your signaling server protocol
            this.signalingServer = {
                url: serverUrl,
                token: token,
                connected: true
            };
            return { success: true };
        } catch (error) {
            log.error('Failed to connect to signaling server:', error);
            return { success: false, error: error.message };
        }
    }

    getSystemInfo() {
        return {
            platform: process.platform,
            version: app.getVersion(),
            electronVersion: process.versions.electron,
            nodeVersion: process.versions.node,
            arch: process.arch
        };
    }
}

// Create app instance
new VoiceApp();