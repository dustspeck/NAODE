package com.naode.overlay.impl

import android.content.Context
import android.graphics.Color
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
import androidx.core.graphics.toColorInt
import com.google.android.material.imageview.ShapeableImageView

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

    private fun createImageView(element: JSONObject): ImageView {
        return ShapeableImageView(context).apply {
            try {
                setImageURI(element.getString("uri").toUri())
                scaleType = ImageView.ScaleType.FIT_CENTER
                rotation = element.optDouble("rotation", 0.0).toFloat()
                
                // Calculate corner radius based on the smaller dimension
                val size = element.getJSONObject("size")
                val width = size.getDouble("width")
                val height = size.getDouble("height")
                val borderRadius = element.optDouble("borderRadius", 0.0)
                val radius = if (width > height) {
                    (height * dP / 100) * borderRadius
                } else {
                    (width * dP/ 100) * borderRadius
                }
                
                // Apply corner radius
                shapeAppearanceModel = shapeAppearanceModel.toBuilder()
                    .setAllCornerSizes(radius.toFloat())
                    .build()
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
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = (position.getDouble("x") * dP).toInt()
            y = (position.getDouble("y") * dP).toInt()
        }
    }
} 