package com.naode.overlay.impl

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.util.DisplayMetrics
import android.view.Gravity
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import com.naode.R
import com.naode.overlay.interfaces.OverlayViewManager
import org.json.JSONObject
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import androidx.core.net.toUri
import androidx.core.graphics.toColorInt
import com.google.android.material.imageview.ShapeableImageView
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin
import android.graphics.drawable.BitmapDrawable
import android.view.ViewGroup

class OverlayViewManagerImpl(
    private val context: Context,
    private val windowManager: WindowManager
) : OverlayViewManager {
    private val TAG = "OverlayViewManagerImpl"
    private val displayMetrics: DisplayMetrics = context.resources.displayMetrics
    private val dP = displayMetrics.density
    private val mainHandler = Handler(Looper.getMainLooper())
    private val viewCleanupQueue = mutableListOf<View>()

    override fun createView(element: JSONObject): View {
        return when (element.getString("type")) {
            "text" -> createTextView(element)
            "image" -> createImageView(element)
            else -> throw IllegalArgumentException("Unknown element type: ${element.getString("type")}")
        }
    }

    override fun addView(view: View, params: WindowManager.LayoutParams) {
        try {
            if (view.parent == null) {
                windowManager.addView(view, params)
            } else {
                Log.w(TAG, "View already has a parent, skipping addView")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error adding view", e)
            cleanupView(view)
            throw e
        }
    }

    override fun removeView(view: View) {
        try {
            if (view.parent != null) {
                windowManager.removeView(view)
            }
            cleanupView(view)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing view", e)
            scheduleViewCleanup(view)
        }
    }

    private fun cleanupView(view: View) {
        try {
            when (view) {
                is ImageView -> {
                    val drawable = view.drawable
                    if (drawable is BitmapDrawable) {
                        val bitmap = drawable.bitmap
                        if (bitmap != null && !bitmap.isRecycled) {
                            bitmap.recycle()
                        }
                    }
                }
            }
            view.visibility = View.GONE
            if (view is ViewGroup) {
                view.removeAllViews()
            }
            view.destroyDrawingCache()
        } catch (e: Exception) {
            Log.e(TAG, "Error during view cleanup", e)
        }
    }

    private fun scheduleViewCleanup(view: View) {
        synchronized(viewCleanupQueue) {
            viewCleanupQueue.add(view)
        }
        mainHandler.post {
            synchronized(viewCleanupQueue) {
                val viewsToCleanup = viewCleanupQueue.toList()
                viewCleanupQueue.clear()
                viewsToCleanup.forEach { cleanupView(it) }
            }
        }
    }

    override fun removeAllViews() {
        // Implementation will be handled by the service
    }

    private fun createTextView(element: JSONObject): TextView {
        return TextView(context).apply {
            text = element.getString("text")
            textSize = element.getDouble("fontSize").toFloat()
            try {
                val fontFamily = element.getString("fontFamily")
                val typeface = Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf")
                setTypeface(typeface, when (element.getString("fontWeight")) {
                    "bold" -> Typeface.BOLD
                    else -> Typeface.NORMAL
                })
            } catch (e: Exception) {
                Log.e(TAG, "Error loading font: ${element.getString("fontFamily")}", e)
                // Fallback to default font if custom font loading fails
                typeface = when (element.getString("fontWeight")) {
                    "bold" -> Typeface.DEFAULT_BOLD
                    else -> Typeface.DEFAULT
                }
            }
            try {
                val color = element.getString("color").toColorInt()
                setTextColor(color)
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing color: ${element.getString("color")}", e)
                setTextColor(Color.WHITE)
            }
            rotation = element.optDouble("rotation", 0.0).toFloat()
            Log.d(TAG, "Rotation: ${element.optDouble("rotation", 0.0)}")
        }
    }

    private fun createImageView(element: JSONObject): View {
        val size = element.getJSONObject("size")
        val width = size.getDouble("width") * dP
        val height = size.getDouble("height") * dP

        val rotationDeg = element.optDouble("rotation", 0.0).toFloat()
        val angle = Math.toRadians(rotationDeg.toDouble())
        val rotatedW = abs(width * cos(angle)) + abs(height * sin(angle))
        val rotatedH = abs(width * sin(angle)) + abs(height * cos(angle))

        val imageView = ShapeableImageView(context).apply {
            layoutParams = FrameLayout.LayoutParams(width.toInt(), height.toInt(), Gravity.CENTER)
            try {
                setImageURI(element.getString("uri").toUri())
            } catch (e: Exception) {
                Log.e(TAG, "Error loading image: ${element.getString("uri")}", e)
                setImageResource(R.drawable.overlay_image)
            }
            scaleType = ImageView.ScaleType.FIT_CENTER
            val borderRadius = element.optDouble("borderRadius", 0.0)
            val radius = if (width > height) {
                (height / 100) * borderRadius
            } else {
                (width / 100) * borderRadius
            }
            shapeAppearanceModel = shapeAppearanceModel.toBuilder()
                .setAllCornerSizes(radius.toFloat())
                .build()

        }
        return FrameLayout(context).apply {
            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), rotatedH.toInt())
            addView(imageView)
            rotation = rotationDeg
            clipChildren = false
            clipToPadding = false

        }
    }

    fun createLayoutParams(element: JSONObject): WindowManager.LayoutParams {
        val position = element.getJSONObject("position")
        val size = element.getJSONObject("size")

        val width = size.getDouble("width") * dP
        val height = size.getDouble("height") * dP

        val rotationDeg = element.optDouble("rotation", 0.0)
        val angle = Math.toRadians(rotationDeg)
        val rotatedW = abs(width * cos(angle)) + abs(height * sin(angle))
        val rotatedH = abs(width * sin(angle)) + abs(height * cos(angle))

        val dx = ((rotatedW - width) / 2).toInt()
        val dy = ((rotatedH - height) / 2).toInt()

        val x = (position.getDouble("x") * dP).toInt() - dx
        val y = (position.getDouble("y") * dP).toInt() - dy

        return WindowManager.LayoutParams(
            rotatedW.toInt(),
            rotatedH.toInt(),
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            this.x = x
            this.y = y
        }
    }


}