const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    maximizeWindow: () => ipcRenderer.send('window:maximize'),
    closeWindow: () => ipcRenderer.send('window:close'),

    // Notifications
    showNotification: (title, body) => ipcRenderer.send('show-notification', title, body),

    // Audio device management
    onAudioDevicesChanged: (callback) => ipcRenderer.on('refresh-audio-devices', callback),
    removeAudioDevicesListener: () => ipcRenderer.removeAllListeners('refresh-audio-devices'),

    // Screen capture for screen sharing
    getSources: async () => {
        const { desktopCapturer } = require('electron');
        return await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 150, height: 150 }
        });
    },

    // System info
    platform: process.platform,

    // Version info
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
});

// Listen for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});