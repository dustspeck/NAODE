package com.naode.overlay

import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.*
import com.naode.utils.CommonUtil

class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val context: ReactApplicationContext = reactContext

    companion object {
        private const val TAG = "OverlayModule"
    }

    override fun getName(): String {
        return "OverlayModule"
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise){
        promise.resolve(CommonUtil.checkAccessibilityPermission(context))
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise){
        CommonUtil.requestAccessibilityPermission(context)
        Toast.makeText(reactApplicationContext, "Please grant accessibility permission", Toast.LENGTH_SHORT).show()
    }

    @ReactMethod
    fun updateOverlay(promise: Promise) {
        try {
            // Get the service instance and call showOverlays
            val service = OverlayAccessibilityService()
            service.showOverlays()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error updating overlay", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun triggerTickHaptic(){
        CommonUtil.triggerTickHaptic(reactApplicationContext)
    }

    @ReactMethod
    fun lockScreen() {
        CommonUtil.lockScreen(reactApplicationContext)
    }
} 