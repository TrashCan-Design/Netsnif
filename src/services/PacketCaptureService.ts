import { Capacitor } from '@capacitor/core';

const PacketCaptureModule = Capacitor.Plugins.PacketCaptureModule;

interface PacketCaptureServiceInterface {
  startCapture(): Promise<any>;
  stopCapture(): Promise<any>;
  addPacketListener(callback: (packet: any) => void): any; // Replace 'any' with specific type if available
}

const PacketCaptureService: PacketCaptureServiceInterface = {
  async startCapture(): Promise<any> {
    try {
      const result = await PacketCaptureModule.startVpn(); // Assuming 'startVpn' is the correct method
      return result;
    } catch (error) {
      console.error('Failed to start VPN:', error);
      throw error; // Re-throw the error to be handled in the component
    }
  },

  async stopCapture(): Promise<any> {
    try {
      const result = await PacketCaptureModule.stopVpn(); // Assuming 'stopVpn' is the correct method
      return result;
    } catch (error) {
      console.error('Failed to stop VPN:', error);
      throw error;
    }
  },

  addPacketListener(callback: (packet: any) => void) {
    // Assuming `PacketCaptureModule` emits events. Adjust as needed.
    const listener = PacketCaptureModule.addListener('onPacketCaptured', callback);
    return {
      remove: () => listener.remove(), // Assuming listener has a 'remove' method
    };
  },
};

export const startCapture = PacketCaptureService.startCapture;
export const stopCapture = PacketCaptureService.stopCapture;
export const addPacketListener = PacketCaptureService.addPacketListener;