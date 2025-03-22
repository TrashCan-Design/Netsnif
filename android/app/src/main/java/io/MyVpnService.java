package com.example.netsniff;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import android.util.Base64;

public class MyVpnService extends VpnService implements Runnable {
    private static final String TAG = "MyVpnService";
    private ParcelFileDescriptor vpnInterface;
    private ExecutorService executorService;
    private boolean isRunning = false;

    // Callback interface for packet events
    public interface PacketCallback {
        void onPacketCaptured(String source, String destination, String protocol, String info, byte[] data);
    }

    private static PacketCallback packetCallback;

    public static void setPacketCallback(PacketCallback callback) {
        packetCallback = callback;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (isRunning) {
            Log.d(TAG, "VPN Service already running");
            return START_STICKY;
        }

        Log.d(TAG, "Starting VPN Service");

        // Create a VPN interface
        try {
            vpnInterface = new Builder()
                    .addAddress("10.0.0.1", 24)
                    .addRoute("0.0.0.0", 0)
                    .addDnsServer("8.8.8.8")
                    .setSession("Packet Capture VPN")
                    .establish();

            isRunning = true;

            // Start processing in a background thread
            executorService = Executors.newSingleThreadExecutor();
            executorService.submit(this);

            return START_STICKY;
        } catch (Exception e) {
            Log.e(TAG, "Error starting VPN service", e);
            return START_NOT_STICKY;
        }
    }

    @Override
    public void run() {
        Log.d(TAG, "VPN thread started");

        try {
            FileInputStream in = new FileInputStream(vpnInterface.getFileDescriptor());
            FileOutputStream out = new FileOutputStream(vpnInterface.getFileDescriptor());

            // Allocate the buffer for a single packet
            ByteBuffer packet = ByteBuffer.allocate(32767);

            // Read packets until the VPN is closed
            while (isRunning) {
                // Clear the buffer before reading
                packet.clear();

                // Read a packet
                int length = in.read(packet.array());
                if (length > 0) {
                    // Analyze the packet
                    analyzePacket(packet.array(), length);

                    // Write the outgoing packet
                    out.write(packet.array(), 0, length);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in VPN thread", e);
        } finally {
            closeVpnInterface();
        }
    }

    private void analyzePacket(byte[] packet, int length) {
        // This is a simplified packet analysis
        // In a real app, you would parse the IP headers, TCP/UDP headers, etc.

        if (length < 20) {
            // Packet too small to be a valid IP packet
            return;
        }

        // Get IP version (first 4 bits of first byte)
        int ipVersion = (packet[0] >> 4) & 0xF;

        if (ipVersion == 4) {
            // IPv4 packet

            // Extract source and destination IP addresses
            String sourceIp = String.format("%d.%d.%d.%d",
                    packet[12] & 0xFF, packet[13] & 0xFF,
                    packet[14] & 0xFF, packet[15] & 0xFF);

            String destIp = String.format("%d.%d.%d.%d",
                    packet[16] & 0xFF, packet[17] & 0xFF,
                    packet[18] & 0xFF, packet[19] & 0xFF);

            // Get protocol (TCP=6, UDP=17, etc.)
            int protocol = packet[9] & 0xFF;
            String protocolName = getProtocolName(protocol);

            // Get packet info
            String info = "IPv4 Packet";

            // Notify callback if available
            if (packetCallback != null) {
                packetCallback.onPacketCaptured(sourceIp, destIp, protocolName, info, packet);
            }

            Log.d(TAG, "Captured IPv4 packet: " + sourceIp + " -> " + destIp + " (" + protocolName + ")");
        } else if (ipVersion == 6) {
            // IPv6 packet (simplified)
            Log.d(TAG, "Captured IPv6 packet");

            if (packetCallback != null) {
                packetCallback.onPacketCaptured("IPv6", "IPv6", "IPv6", "IPv6 Packet", packet);
            }
        }
    }

    private String getProtocolName(int protocol) {
        switch (protocol) {
            case 1: return "ICMP";
            case 6: return "TCP";
            case 17: return "UDP";
            default: return "IP(" + protocol + ")";
        }
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "Destroying VPN Service");
        isRunning = false;
        closeVpnInterface();
        if (executorService != null) {
            executorService.shutdownNow();
        }
        super.onDestroy();
    }

    private void closeVpnInterface() {
        if (vpnInterface != null) {
            try {
                vpnInterface.close();
                vpnInterface = null;
            } catch (Exception e) {
                Log.e(TAG, "Error closing VPN interface", e);
            }
        }
    }
}