package com.example.netsniff;

import android.content.Intent;
import android.net.VpnService;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.example.netsniff.MyVpnService;


@CapacitorPlugin(name = "PacketCaptureModule")
public class PacketCapturePlugin extends Plugin implements MyVpnService.PacketCallback {

    private static final String TAG = "PacketCapturePlugin";
    private static final int VPN_REQUEST_CODE = 1234;

    @Override
    public void load() {
        super.load();
        MyVpnService.setPacketCallback(this);
    }

    @PluginMethod()
    public void startVpn(final PluginCall call) {
        try {
            // Check if VPN permission is granted
            Intent intent = VpnService.prepare(getActivity());
            if (intent != null) {
                // VPN permission not granted, need to request it
                // In a real app, you would need to handle the activity result
                // and resolve the promise later
                call.reject("PERMISSION_NEEDED", "VPN permission is required");

                // Launch the permission dialog
                getActivity().startActivityForResult(intent, VPN_REQUEST_CODE);
            } else {
                // VPN permission already granted, start the service
                Intent serviceIntent = new Intent(getActivity(), MyVpnService.class);
                getActivity().startService(serviceIntent);

                call.resolve();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error starting VPN", e);
            call.reject("ERROR", e.getMessage());
        }
    }

    @PluginMethod()
    public void stopVpn(final PluginCall call) {
        try {
            // Stop the VPN service
            Intent intent = new Intent(getActivity(), MyVpnService.class);
            getActivity().stopService(intent);
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Error stopping VPN", e);
            call.reject("ERROR", e.getMessage());
        }
    }


    // Implement the packet callback
    @Override
    public void onPacketCaptured(String source, String destination, String protocol, String info, byte[] data) {
        try {
            // Create event data
            JSObject ret = new JSObject();
            ret.put("source", source);
            ret.put("destination", destination);
            ret.put("protocol", protocol);
            ret.put("info", info);
            ret.put("timestamp", String.valueOf(System.currentTimeMillis()));

            // Convert binary data to Base64 string
            String base64Data = Base64.encodeToString(data, Base64.DEFAULT);
            ret.put("data", base64Data);

            // Send event to JavaScript
            notifyListeners("onPacketCaptured", ret);
        } catch (Exception e) {
            Log.e(TAG, "Error sending packet event", e);
        }
    }
}