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
import androidx.core.net.toUri
import com.naode.R
import com.tencent.mmkv.MMKV
import org.json.JSONArray
import org.json.JSONObject

class OverlayAccessibilityService : AccessibilityService() {
    private var windowManager: WindowManager? = null
    private val overlayViews = mutableMapOf<String, ImageView>()
    private var isScreenOff = false
    // private lateinit var mmkv: MMKV

    companion object {
        private const val TAG = "OverlayAccessibilityService"
        private lateinit var mmkv: MMKV
        private const val OVERLAY_SIZE = 400
        private const val MMKV_ID = "mmkv_id"
        private const val OVERLAY_STORE_KEY = "OVERLAY_STORE"
    }

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> {
                    Log.d(TAG, "Screen turned off")
                    isScreenOff = true
                    showOverlays()
                }
                Intent.ACTION_SCREEN_ON -> {
                    Log.d(TAG, "Screen turned on")
                    isScreenOff = false
                    removeOverlays()
                }
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        Log.d(TAG, "Service connected")
        
        // Read and log overlay values
        // readAndLogOverlayValues()
        // Register screen state receiver
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        registerReceiver(screenStateReceiver, filter)
        MMKV.initialize(this)
        mmkv = MMKV.mmkvWithID(MMKV_ID, MMKV.MULTI_PROCESS_MODE)
    }

    private fun readAndLogOverlayValues(): List<OverlayConfig> {
//        overlays
//        :
//        Array(1)
//        0
//        :
//        customImagePath
//        :
//        "file:///data/user/0/com.naode/cache/rn_image_picker_lib_temp_6e1b5074-bc30-4575-afa2-41a5fadc3965.png"
//        id
//        :
//        "otjd909cofaq3no4w499r"
//        size
//        :
//        400
        val overlayStoreJson = mmkv.getString(OVERLAY_STORE_KEY, "{\"overlays\":[{\"id\":\"otjd909cofaq3no4w499r\",\"size\": 400, \"customImagePath:\"file:///data/user/0/com.naode/cache/rn_image_picker_lib_temp_6e1b5074-bc30-4575-afa2-41a5fadc3965.png\"\"}]}")
        Log.d(TAG, "Raw MMKV value: $overlayStoreJson")
        
        return try {
            val jsonObject = JSONObject(overlayStoreJson)
            val overlaysArray = jsonObject.getJSONArray("overlays")
            val configs = mutableListOf<OverlayConfig>()
            
            for (i in 0 until overlaysArray.length()) {
                val overlayJson = overlaysArray.getJSONObject(i)
                val id = overlayJson.getString("id")
                val size = overlayJson.optInt("size", OVERLAY_SIZE)
                val customImagePath = overlayJson.optString("customImagePath", "null")
                
                Log.d(TAG, "Parsed overlay values for $id:")
                Log.d(TAG, "Size: $size")
                Log.d(TAG, "Custom Image Path: $customImagePath")
                
                configs.add(OverlayConfig(id, size, customImagePath))
            }
            
            configs
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing overlay values: ${e.message}")
            Log.e(TAG, "Error parsing overlay values", e)
            emptyList()
        }
    }

    fun showOverlays() {
        if (!isScreenOff) {
            Log.d(TAG, "Screen is on, not showing overlays")
            return
        }

        removeOverlays()

        try {
            val configs = readAndLogOverlayValues()
            
            // Get screen dimensions
            val displayMetrics = DisplayMetrics()
            windowManager?.defaultDisplay?.getMetrics(displayMetrics)
            val screenWidth = displayMetrics.widthPixels
            val screenHeight = displayMetrics.heightPixels

            // Calculate grid layout
            val numOverlays = configs.size
//            val cols = if (numOverlays <= 2) numOverlays else 2
            val cols = 2
            val rows = (numOverlays + cols - 1) / cols

            configs.forEachIndexed { index, config ->
                val row = index / cols
                val col = index % cols
                
                // Calculate position
                val x = (screenWidth / cols) * col + (screenWidth / cols - config.size) / 2
                val y = (screenHeight / rows) * row + (screenHeight / rows - config.size) / 2

                val overlayView = ImageView(this).apply {
                    if (config.customImagePath.startsWith("file:")) {
                        Log.d(TAG, "Loading custom image from path: ${config.customImagePath}")
                        setImageURI(config.customImagePath.toUri())
                    } else {
                        setImageResource(R.drawable.overlay_image)
                    }
                    scaleType = ImageView.ScaleType.FIT_CENTER
                }

                val params = WindowManager.LayoutParams(
                    config.size,
                    config.size,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.START
                    this.x = x
                    this.y = y
                }

                windowManager?.addView(overlayView, params)
                overlayViews[config.id] = overlayView
                Log.d(TAG, "Overlay ${config.id} shown at position ($x, $y) with size ${config.size}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error showing overlays", e)
            removeOverlays()
        }
    }

    private fun removeOverlays() {
        try {
            overlayViews.forEach { (id, view) ->
                windowManager?.removeView(view)
                Log.d(TAG, "Overlay $id removed successfully")
            }
            overlayViews.clear()
        } catch (e: Exception) {
            Log.e(TAG, "Error removing overlays", e)
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
        removeOverlays()
    }

    data class OverlayConfig(
        val id: String,
        val size: Int,
        val customImagePath: String
    )
} 