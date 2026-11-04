import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  startEmulation: (params: unknown) => ipcRenderer.invoke('emulator:start', params),
  stopEmulation: () => ipcRenderer.invoke('emulator:stop'),
  getEmulationStatus: () => ipcRenderer.invoke('emulator:get-status'),
  checkDiscord: () => ipcRenderer.invoke('emulator:check-discord'),
  getPresets: () => ipcRenderer.invoke('emulator:get-presets'),
  saveCustomPreset: (preset: unknown) => ipcRenderer.invoke('emulator:save-custom-preset', preset),
  deleteCustomPreset: (id: string) => ipcRenderer.invoke('emulator:delete-custom-preset', id),
  openStubWindow: () => ipcRenderer.invoke('emulator:open-stub-window'),
  selectExeFile: () => ipcRenderer.invoke('dialog:select-exe'),
  getRunningProcesses: () => ipcRenderer.invoke('system:get-running-processes'),

  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  onStateUpdate: (callback: (state: unknown) => void) => {
    const subscription = (_event: unknown, state: unknown) => callback(state);
    ipcRenderer.on('emulation-state-changed', subscription);
    return () => {
      ipcRenderer.removeListener('emulation-state-changed', subscription);
    };
  },
});
