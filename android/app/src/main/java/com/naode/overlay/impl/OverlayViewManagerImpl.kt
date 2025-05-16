package com.naode.overlay.impl

import android.content.Context
import android.graphics.PixelFormat
import android.graphics.Typeface
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
import androidx.core.net.toUri

class OverlayViewManagerImpl(
    private val context: Context,
    private val windowManager: WindowManager
) : OverlayViewManager {
    private val TAG = "OverlayViewManagerImpl"
    private val displayMetrics: DisplayMetrics = context.resources.displayMetrics
    private val dP = displayMetrics.density

    override fun createView(element: JSONObject): View {
        return when (element.getString("type")) {
            "text" -> createTextView(element)
            "image" -> createImageView(element)
            else -> throw IllegalArgumentException("Unknown element type: ${element.getString("type")}")
        }
    }

    override fun addView(view: View, params: WindowManager.LayoutParams) {
        try {
            windowManager.addView(view, params)
        } catch (e: Exception) {
            Log.e(TAG, "Error adding view", e)
            throw e
        }
    }

    override fun removeView(view: View) {
        try {
            windowManager.removeView(view)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing view", e)
        }
    }

    override fun removeAllViews() {
        // Implementation will be handled by the service
    }

    private fun createTextView(element: JSONObject): TextView {
        return TextView(context).apply {
            text = element.getString("text")
            textSize = element.getDouble("fontSize").toFloat()
            typeface = when (element.getString("fontWeight")) {
                "bold" -> Typeface.create(element.getString("fontFamily"), Typeface.BOLD)
                else -> Typeface.create(element.getString("fontFamily"), Typeface.NORMAL)
            }
            rotation = element.optDouble("rotation", 0.0).toFloat()
        }
    }

    private fun createImageView(element: JSONObject): ImageView {
        return ImageView(context).apply {
            try {
                setImageURI(element.getString("uri").toUri())
                scaleType = ImageView.ScaleType.FIT_CENTER
                rotation = element.optDouble("rotation", 0.0).toFloat()
            } catch (e: Exception) {
                Log.e(TAG, "Error loading image: ${element.getString("uri")}", e)
                setImageResource(R.drawable.overlay_image)
            }
        }
    }

    fun createLayoutParams(element: JSONObject): WindowManager.LayoutParams {
        val position = element.getJSONObject("position")
        val size = element.getJSONObject("size")
        
        return WindowManager.LayoutParams(
            (size.getDouble("width") * dP).toInt(),
            (size.getDouble("height") * dP).toInt(),
            WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (position.getDouble("x") * dP).toInt()
            y = (position.getDouble("y") * dP).toInt()
        }
    }
} 