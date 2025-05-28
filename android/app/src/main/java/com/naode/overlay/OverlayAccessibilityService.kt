package com.naode.overlay

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.LruCache
import android.view.WindowManager
import android.view.View
import android.view.accessibility.AccessibilityEvent
import android.widget.ImageView
import androidx.annotation.RequiresApi
import com.naode.overlay.impl.OverlayDataStoreImpl
import com.naode.overlay.impl.OverlayStateManagerImpl
import com.naode.overlay.impl.OverlayViewManagerImpl
import com.naode.utils.CommonUtil
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.atomic.AtomicInteger
import kotlin.system.measureTimeMillis
import androidx.core.graphics.createBitmap

class OverlayAccessibilityService : AccessibilityService() {
    private val TAG = "OverlayAccessibilityService"
    private val mainHandler = Handler(Looper.getMainLooper())
    private val overlayViews = mutableMapOf<String, View>()
    
    // Use LruCache for better memory management
    private val bitmapCache = object : LruCache<String, Bitmap>(calculateCacheSize()) {
        override fun sizeOf(key: String, bitmap: Bitmap): Int {
            return bitmap.byteCount
        }
    }

    private lateinit var windowManager: WindowManager
    private lateinit var viewManager: OverlayViewManagerImpl
    private lateinit var dataStore: OverlayDataStoreImpl
    private lateinit var stateManager: OverlayStateManagerImpl

    // Use a custom dispatcher for better performance
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default + CoroutineExceptionHandler { _, throwable ->
        Log.e(TAG, "Coroutine error", throwable)
        recoverService()
    })

    private var isServiceActive = false
    private val recoveryCounter = AtomicInteger(0)
    private var lastRecoveryTime = 0L

    companion object {
        private const val NOTIFICATION_TIMEOUT = 200L
        private const val SERVICE_RECOVERY_DELAY = 1000L
        private const val MAX_RECOVERY_ATTEMPTS = 3
        private const val RECOVERY_COOLDOWN = 5000L
        private const val CACHE_SIZE_PERCENT = 0.25f // Use 25% of available memory for cache
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
            val time = measureTimeMillis {
                initializeComponents()
                registerScreenStateReceiver()
                initializeService()
                stateManager.setServiceActive(true)
            }
            Log.d(TAG, "Service connected successfully in ${time}ms")
        } catch (e: Exception) {
            Log.e(TAG, "Error in onServiceConnected", e)
            recoverService()
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

    private fun calculateCacheSize(): Int {
        val maxMemory = (Runtime.getRuntime().maxMemory() / 1024).toInt()
        return (maxMemory * CACHE_SIZE_PERCENT).toInt()
    }

    private fun getSecureFilePath(index: Int): String {
        val baseDir = File(filesDir, "aod")
        if (!baseDir.exists()) {
            baseDir.mkdirs()
        }
        return File(baseDir, "aod_${index + 1}.png").absolutePath
    }

    private fun validateImagePath(path: String): Boolean {
        return try {
            val file = File(path)
            file.exists() && file.isFile && file.canRead() && file.length() > 0
        } catch (e: Exception) {
            Log.e(TAG, "Error validating image path: $path", e)
            false
        }
    }

    private fun loadBitmap(path: String, brightness: Double): Bitmap? {
        if (!validateImagePath(path)) {
            Log.e(TAG, "Invalid image path: $path")
            return null
        }

        // Check cache first
        bitmapCache.get(path)?.let { return it }

        return try {
            val options = BitmapFactory.Options().apply {
                inSampleSize = calculateInSampleSize(path)
                inPreferredConfig = Bitmap.Config.ARGB_8888 // Use ARGB to preserve transparency
            }
            
            BitmapFactory.decodeFile(path, options)?.let { originalBitmap ->
                // Create a new bitmap with the same dimensions
                val adjustedBitmap = createBitmap(originalBitmap.width, originalBitmap.height)
                
                // Apply brightness adjustment while preserving transparency
                val canvas = Canvas(adjustedBitmap)
                val paint = Paint().apply {
                    colorFilter = ColorMatrixColorFilter(ColorMatrix().apply {
                        val b = brightness.toFloat()
                        val array = FloatArray(20) { 0f }
                        array[0] = b  // Red
                        array[6] = b  // Green
                        array[12] = b // Blue
                        array[18] = 1f
                        set(array)
                    })
                }
                
                canvas.drawBitmap(originalBitmap, 0f, 0f, paint)
                originalBitmap.recycle() // Free up memory
                
                adjustedBitmap.also { bitmap ->
                    bitmapCache.put(path, bitmap)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error loading bitmap from path: $path", e)
            null
        }
    }

    private fun calculateInSampleSize(path: String): Int {
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }
        BitmapFactory.decodeFile(path, options)
        
        val displayMetrics = resources.displayMetrics
        val reqWidth = displayMetrics.widthPixels
        val reqHeight = displayMetrics.heightPixels
        
        var inSampleSize = 1
        if (options.outHeight > reqHeight || options.outWidth > reqWidth) {
            val halfHeight = options.outHeight / 2
            val halfWidth = options.outWidth / 2
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        return inSampleSize
    }

    fun showOverlays() {
        if (!stateManager.isServiceActive() || !stateManager.isScreenOff()) {
            Log.d(TAG, "Service not active or screen is on, not showing overlays")
            return
        }

        serviceScope.launch {
            try {
                val isEnabled = withContext(Dispatchers.IO) {
                    dataStore.isOverlayEnabled()
                }

                val brightness = withContext(Dispatchers.IO) {
                    dataStore.getOverlayBrightness()
                }
                
                if (!isEnabled) {
                    Log.d(TAG, "Overlays are disabled, not showing overlays")
                    return@launch
                }

                withContext(Dispatchers.Main) {
                    removeOverlays()
                    try {
                        val time = measureTimeMillis {
                            val screensStore = dataStore.getScreensStore()
                            val selectedIndex = screensStore.optInt("selectedIndex", 0)
                            val imagePath = getSecureFilePath(selectedIndex)

                            val bitmap = loadBitmap(imagePath, brightness) ?: return@withContext
                            
                            val imageView = ImageView(this@OverlayAccessibilityService).apply {
                                setImageBitmap(bitmap)
                                scaleType = ImageView.ScaleType.FIT_CENTER
                            }

                            val displayMetrics = resources.displayMetrics
                            val params = WindowManager.LayoutParams(
                                displayMetrics.widthPixels,
                                displayMetrics.heightPixels,
                                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                                WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                                        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                                PixelFormat.TRANSLUCENT
                            ).apply {
                                gravity = android.view.Gravity.TOP or android.view.Gravity.END
                                x = 0
                                y = 0
                            }

                            windowManager.addView(imageView, params)
                            overlayViews["fullscreen_image"] = imageView
                        }
                        Log.d(TAG, "Overlay shown in ${time}ms")
                    } catch (e: Exception) {
                        Log.e(TAG, "Error showing full screen image", e)
                        removeOverlays()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error showing overlays", e)
                withContext(Dispatchers.Main) {
                    removeOverlays()
                }
            }
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
        bitmapCache.evictAll()
        mainHandler.removeCallbacksAndMessages(null)
        serviceScope.cancel()
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
        val currentTime = System.currentTimeMillis()
        if (currentTime - lastRecoveryTime < RECOVERY_COOLDOWN) {
            Log.d(TAG, "Recovery cooldown in effect, skipping recovery attempt")
            return
        }

        if (recoveryCounter.incrementAndGet() > MAX_RECOVERY_ATTEMPTS) {
            Log.e(TAG, "Max recovery attempts reached, resetting recovery state")
            recoveryCounter.set(0)
            lastRecoveryTime = currentTime
            reinitializeService()
            return
        }

        lastRecoveryTime = currentTime
        
        serviceScope.launch {
            try {
                withContext(Dispatchers.Main) {
                    initializeService()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to recover service: ${e.message}")
                mainHandler.postDelayed({
                    recoverService()
                }, SERVICE_RECOVERY_DELAY)
            }
        }
    }

    private fun reinitializeService() {
        serviceScope.launch {
            try {
                withContext(Dispatchers.Main) {
                    removeOverlays()
                    bitmapCache.evictAll()
                    initializeComponents()
                    initializeService()
                    recoveryCounter.set(0)
                    lastRecoveryTime = System.currentTimeMillis()
                    Log.d(TAG, "Service reinitialized successfully")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to reinitialize service: ${e.message}")
                mainHandler.postDelayed({
                    recoverService()
                }, SERVICE_RECOVERY_DELAY)
            }
        }
    }
}
