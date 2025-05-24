package com.naode.overlay

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.WindowManager
import android.view.View
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import com.naode.overlay.impl.OverlayDataStoreImpl
import com.naode.overlay.impl.OverlayStateManagerImpl
import com.naode.overlay.impl.OverlayViewManagerImpl
import com.naode.utils.CommonUtil
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

class OverlayAccessibilityService : AccessibilityService() {
    private val TAG = "OverlayAccessibilityService"
    private val mainHandler = Handler(Looper.getMainLooper())
    private val overlayViews = mutableMapOf<String, View>()
    
    private lateinit var windowManager: WindowManager
    private lateinit var viewManager: OverlayViewManagerImpl
    private lateinit var dataStore: OverlayDataStoreImpl
    private lateinit var stateManager: OverlayStateManagerImpl

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var isServiceActive = false

    companion object {
        private const val NOTIFICATION_TIMEOUT = 200L
        private const val SERVICE_RECOVERY_DELAY = 1000L
    }

    private val screenStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                Intent.ACTION_SCREEN_OFF -> {
                    Log.d(TAG, "Screen turned off")
                    stateManager.setScreenOff(true)
                    mainHandler.post { showOverlays() }
                }
                Intent.ACTION_SCREEN_ON -> {
                    Log.d(TAG, "Screen turned on")
                    stateManager.setScreenOff(false)
                    mainHandler.post { removeOverlays() }
                }
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        try {
            initializeComponents()
            registerScreenStateReceiver()
            stateManager.setServiceActive(true)
            Log.d(TAG, "Service connected successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error in onServiceConnected", e)
            stopSelf()
        }
    }

    private fun initializeComponents() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        viewManager = OverlayViewManagerImpl(this, windowManager)
        dataStore = OverlayDataStoreImpl(this)
        stateManager = OverlayStateManagerImpl()
    }

    private fun registerScreenStateReceiver() {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        registerReceiver(screenStateReceiver, filter)
    }

    fun showOverlays() {
        if (!stateManager.isServiceActive() || !stateManager.isScreenOff()) {
            Log.d(TAG, "Service not active or screen is on, not showing overlays")
            return
        }

        if (!dataStore.isOverlayEnabled()) {
            Log.d(TAG, "Overlays are disabled, not showing overlays")
            return
        }

        removeOverlays()

        try {
            val elements = dataStore.getOverlayElements()
            val elementsArray = elements.getJSONArray("elements")

            // Convert to list and sort by zIndex
            val sortedElements = mutableListOf<JSONObject>()
            for (i in 0 until elementsArray.length()) {
                sortedElements.add(elementsArray.getJSONObject(i))
            }
            sortedElements.sortBy { it.optInt("zIndex", 0) }

            // Add views in sorted order
            for (element in sortedElements) {
                val id = element.getString("id")

                try {
                    val view = viewManager.createView(element)
                    val params = viewManager.createLayoutParams(element)
                    // TODO: Remove this once we have a proper way to handle the width of the text
                    if (element.getString("type") == "text") params.width += 30
                    viewManager.addView(view, params)
                    overlayViews[id] = view
                    Log.d(TAG, "Added overlay $id")
                } catch (e: Exception) {
                    Log.e(TAG, "Error creating overlay for element $id", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error showing overlays", e)
            removeOverlays()
        }
    }

    fun removeOverlays() {
        try {
            overlayViews.forEach { (id, view) ->
                try {
                    viewManager.removeView(view)
                    Log.d(TAG, "Overlay $id removed successfully")
                } catch (e: Exception) {
                    Log.e(TAG, "Error removing overlay $id", e)
                }
            }
            overlayViews.clear()
        } catch (e: Exception) {
            Log.e(TAG, "Error in removeOverlays", e)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Not needed for our overlay
    }

    override fun onInterrupt() {
        // Not needed for our overlay
    }

    override fun onDestroy() {
        stateManager.setServiceActive(false)
        try {
            unregisterReceiver(screenStateReceiver)
        } catch (e: Exception) {
            Log.e(TAG, "Error unregistering receiver", e)
        }
        removeOverlays()
        mainHandler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    @RequiresApi(Build.VERSION_CODES.P)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try {
            intent?.action?.let { action ->
                when (action) {
                    "LOCK_SCREEN" -> performAction(GLOBAL_ACTION_LOCK_SCREEN)
                    else -> {}
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onStartCommand: ${e.message}")
        }
        return START_STICKY
    }

    private fun performAction(action: Int) {
        if (CommonUtil.checkAccessibilityPermission(this)) {
            try {
                performGlobalAction(action)
            } catch (e: Exception) {
                Log.e(TAG, "Error performing action: ${e.message}")
                recoverService()
            }
        } else {
            CommonUtil.requestAccessibilityPermission(this)
        }
    }

    private fun initializeService() {
        val info = AccessibilityServiceInfo()
        info.apply {
            flags = AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
            notificationTimeout = NOTIFICATION_TIMEOUT
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        }
        serviceInfo = info
        isServiceActive = true
    }

    private fun recoverService() {
        serviceScope.launch {
            try {
                withContext(Dispatchers.Main) {
                    initializeService()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to recover service: ${e.message}")
                // Attempt to restart the service
                mainHandler.postDelayed({
                    val intent = Intent(this@OverlayAccessibilityService, OverlayAccessibilityService::class.java)
                    startService(intent)
                }, SERVICE_RECOVERY_DELAY)
            }
        }
    }
} 