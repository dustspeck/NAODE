package com.naode.overlay

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.PixelFormat
import android.view.Gravity
import android.view.WindowManager
import android.widget.ImageView
import android.util.Log
import android.util.DisplayMetrics
import com.naode.R

class OverlayAccessibilityService : AccessibilityService() {
    private var windowManager: WindowManager? = null
    private var overlayView: ImageView? = null
    private var isScreenOff = false

    companion object {
        private const val TAG = "OverlayAccessibilityService"
        private const val OVERLAY_SIZE = 400
    }

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> {
                    Log.d(TAG, "Screen turned off")
                    isScreenOff = true
                    showOverlay()
                }
                Intent.ACTION_SCREEN_ON -> {
                    Log.d(TAG, "Screen turned on")
                    isScreenOff = false
                    removeOverlay()
                }
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        Log.d(TAG, "Service connected")
        
        // Register screen state receiver
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        registerReceiver(screenStateReceiver, filter)
    }

    private fun showOverlay() {
        if (!isScreenOff) {
            Log.d(TAG, "Screen is on, not showing overlay")
            return
        }

        if (overlayView != null) {
            Log.d(TAG, "Overlay already exists, removing first")
            removeOverlay()
        }

        try {
            // Get screen dimensions
            val displayMetrics = DisplayMetrics()
            windowManager?.defaultDisplay?.getMetrics(displayMetrics)
            val screenWidth = displayMetrics.widthPixels
            val screenHeight = displayMetrics.heightPixels

            // Calculate center position
            val x = (screenWidth - OVERLAY_SIZE) / 2
            val y = (screenHeight - OVERLAY_SIZE) / 2

            overlayView = ImageView(this).apply {
                setImageResource(R.drawable.overlay_image)
                scaleType = ImageView.ScaleType.FIT_CENTER
            }

            val params = WindowManager.LayoutParams(
                OVERLAY_SIZE,
                OVERLAY_SIZE,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                this.x = x
                this.y = y
            }

            windowManager?.addView(overlayView, params)
            Log.d(TAG, "Overlay shown successfully at position ($x, $y)")
        } catch (e: Exception) {
            Log.e(TAG, "Error showing overlay", e)
            overlayView = null
        }
    }

    private fun removeOverlay() {
        try {
            if (overlayView != null) {
                windowManager?.removeView(overlayView)
                overlayView = null
                Log.d(TAG, "Overlay removed successfully")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error removing overlay", e)
        }
    }

    override fun onAccessibilityEvent(event: android.view.accessibility.AccessibilityEvent?) {
        // Not needed for our overlay
    }

    override fun onInterrupt() {
        // Not needed for our overlay
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(screenStateReceiver)
        } catch (e: Exception) {
            Log.e(TAG, "Error unregistering receiver", e)
        }
        removeOverlay()
    }
} 