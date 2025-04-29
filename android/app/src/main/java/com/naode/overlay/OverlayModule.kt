package com.naode.overlay

import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.*

class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        private const val TAG = "OverlayModule"
    }

    override fun getName(): String {
        return "OverlayModule"
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        val accessibilityEnabled = isAccessibilityServiceEnabled()
        Log.d(TAG, "Checking accessibility service: $accessibilityEnabled")
        promise.resolve(accessibilityEnabled)
    }

    @ReactMethod
    fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun updateOverlay(promise: Promise) {
        OverlayAccessibilityService().updateOverlaySize()
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val accessibilityEnabled = Settings.Secure.getInt(
            reactApplicationContext.contentResolver,
            Settings.Secure.ACCESSIBILITY_ENABLED,
            0
        )

        if (accessibilityEnabled == 1) {
            val serviceString = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            Log.d(TAG, "Service string: $serviceString")
            return serviceString?.contains("${reactApplicationContext.packageName}/${reactApplicationContext.packageName}.overlay.OverlayAccessibilityService") == true
        }
        return false
    }
} 