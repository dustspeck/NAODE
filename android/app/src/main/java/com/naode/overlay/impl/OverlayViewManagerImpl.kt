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
import android.widget.FrameLayout
import androidx.core.net.toUri
import androidx.core.graphics.toColorInt
import com.google.android.material.imageview.ShapeableImageView
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin

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

//    private fun createTextView(element: JSONObject): View {
//        val rotationDeg = element.optDouble("rotation", 0.0).toFloat()
//
//        val textView = TextView(context).apply {
//            text = element.getString("text")
//            textSize = element.getDouble("fontSize").toFloat()
//
//            // Strip extra padding
//            setPadding(0, 0, 0, 0)
//            setBackgroundColor(Color.RED)
//            includeFontPadding = false
//            rotation = rotationDeg
//
//            try {
//                val fontFamily = element.getString("fontFamily")
//                val typeface = Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf")
//                setTypeface(typeface, when (element.getString("fontWeight")) {
//                    "bold" -> Typeface.BOLD
//                    else -> Typeface.NORMAL
//                })
//            } catch (e: Exception) {
//                Log.e(TAG, "Error loading font: ${element.optString("fontFamily")}", e)
//                typeface = when (element.optString("fontWeight")) {
//                    "bold" -> Typeface.DEFAULT_BOLD
//                    else -> Typeface.DEFAULT
//                }
//            }
//
//            try {
//                setTextColor(element.getString("color").toColorInt())
//            } catch (e: Exception) {
//                Log.e(TAG, "Error parsing color: ${element.optString("color")}", e)
//                setTextColor(Color.WHITE)
//            }
//
//            gravity = Gravity.CENTER
//        }
//
//        // Measure tightly
//        textView.measure(
//            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED),
//            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
//        )
//
//        val measuredWidth = textView.measuredWidth.toDouble()
//        val measuredHeight = textView.measuredHeight.toDouble()
//
//        // Compute rotated bounding box
//        val angleRad = Math.toRadians(rotationDeg.toDouble())
//        val rotatedW = abs(measuredWidth * cos(angleRad)) + abs(measuredHeight * sin(angleRad))
//        val rotatedH = abs(measuredWidth * sin(angleRad)) + abs(measuredHeight * cos(angleRad))
//
//        textView.layoutParams = FrameLayout.LayoutParams(
//            measuredWidth.toInt(),
//            measuredHeight.toInt(),
//            Gravity.CENTER
//        )
//
//        return FrameLayout(context).apply {
//            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), rotatedH.toInt())
//            addView(textView)
////            rotation = rotationDeg
//            clipChildren = false
//            clipToPadding = false
//            setBackgroundColor(Color.BLUE)
//        }
//    }

//    private fun createTextView(element: JSONObject): View {
//        val rotationDeg = element.optDouble("rotation", 0.0).toFloat()
//        val fontSize = element.getDouble("fontSize").toFloat()
//        val text = element.getString("text")
//        val fontWeight = element.optString("fontWeight", "normal")
//        val fontFamily = element.optString("fontFamily", "")
//        val color = element.optString("color", "#FFFFFF")
//
//        val paint = Paint().apply {
//            isAntiAlias = true
//            textSize = fontSize * context.resources.displayMetrics.scaledDensity
//            typeface = try {
//                Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf").let {
//                    if (fontWeight == "bold") Typeface.create(it, Typeface.BOLD) else it
//                }
//            } catch (e: Exception) {
//                if (fontWeight == "bold") Typeface.DEFAULT_BOLD else Typeface.DEFAULT
//            }
//        }
//
//        val bounds = Rect()
//        paint.getTextBounds(text, 0, text.length, bounds)
//        val textWidth = bounds.width().toDouble()
//        val textHeight = bounds.height().toDouble()
//
//        // Rotated bounding box
//        val angleRad = Math.toRadians(rotationDeg.toDouble())
//        val rotatedW = abs(textWidth * cos(angleRad)) + abs(textHeight * sin(angleRad))
//        val rotatedH = abs(textWidth * sin(angleRad)) + abs(textHeight * cos(angleRad))
//
//        val textView = TextView(context).apply {
//            this.text = text
//            this.textSize = fontSize
//            setTextColor(color.toColorInt())
//
//            setPadding(0, 0, 0, 0)
//            includeFontPadding = false
//            gravity = Gravity.CENTER
//
//            try {
//                val tf = Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf")
//                typeface = if (fontWeight == "bold") Typeface.create(tf, Typeface.BOLD) else tf
//            } catch (e: Exception) {
//                typeface = if (fontWeight == "bold") Typeface.DEFAULT_BOLD else Typeface.DEFAULT
//            }
//
//            layoutParams = FrameLayout.LayoutParams(
//                textWidth.toInt(),
//                textHeight.toInt(),
//                Gravity.CENTER
//            )
//        }
//
//        return FrameLayout(context).apply {
//            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), rotatedH.toInt())
//            addView(textView)
//            rotation = rotationDeg
//            clipChildren = false
//            clipToPadding = false
//        }
//    }

//    private fun createTextView(element: JSONObject): View {
//        val textView = TextView(context).apply {
//            text = element.getString("text")
//            textSize = element.getDouble("fontSize").toFloat()
//            setBackgroundColor(Color.RED)
//
//            // Set font family and weight
//            try {
//                val fontFamily = element.getString("fontFamily")
//                val typeface = Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf")
//                setTypeface(typeface, when (element.getString("fontWeight")) {
//                    "bold" -> Typeface.BOLD
//                    else -> Typeface.NORMAL
//                })
//            } catch (e: Exception) {
//                Log.e(TAG, "Error loading font: ${element.optString("fontFamily")}", e)
//                typeface = when (element.optString("fontWeight")) {
//                    "bold" -> Typeface.DEFAULT_BOLD
//                    else -> Typeface.DEFAULT
//                }
//            }
//
//            // Set text color
//            try {
//                setTextColor(element.getString("color").toColorInt())
//            } catch (e: Exception) {
//                Log.e(TAG, "Error parsing color: ${element.optString("color")}", e)
//                setTextColor(Color.WHITE)
//            }
//
//            // Optional styling
//            gravity = Gravity.CENTER
//        }
//
//        // Extract original size (in dp)
//        val size = element.getJSONObject("size")
//        val width = size.getDouble("width") * dP
//        val height = size.getDouble("height") * dP
//        val textSize = element.getDouble("fontSize").toFloat()
//
//        // Rotation
//        val rotationDeg = element.optDouble("rotation", 0.0).toFloat()
//        val angle = Math.toRadians(rotationDeg.toDouble())
//        val rotatedW = abs(width * cos(angle)) + abs(height * sin(angle))
//        val rotatedH = abs(width * sin(angle)) + abs(height * cos(angle))
//
//        textView.rotation = rotationDeg
//
////        textView.layoutParams = FrameLayout.LayoutParams(width.toInt(), height.toInt(), Gravity.CENTER)
//        textView.layoutParams = FrameLayout.LayoutParams(width.toInt(), (textSize * dP).toInt(), Gravity.CENTER)
//
//        return FrameLayout(context).apply {
////            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), rotatedH.toInt())
//            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), textSize.toInt())
//
//            addView(textView)
//            clipChildren = false
//            clipToPadding = false
//            setBackgroundColor(Color.BLUE)
//            setPadding(0, 0, 0, 0,)
//        }
//    }

//    private fun createTextView(element: JSONObject): View {
//        val rotationDeg = element.optDouble("rotation", 0.0).toFloat()
//
//        val textView = TextView(context).apply {
//            text = element.getString("text")
//            textSize = element.getDouble("fontSize").toFloat()
//            setBackgroundColor(Color.RED)
//
//            try {
//                val fontFamily = element.getString("fontFamily")
//                val typeface = Typeface.createFromAsset(context.assets, "fonts/$fontFamily.ttf")
//                setTypeface(typeface, when (element.getString("fontWeight")) {
//                    "bold" -> Typeface.BOLD
//                    else -> Typeface.NORMAL
//                })
//            } catch (e: Exception) {
//                Log.e(TAG, "Error loading font: ${element.optString("fontFamily")}", e)
//                typeface = when (element.optString("fontWeight")) {
//                    "bold" -> Typeface.DEFAULT_BOLD
//                    else -> Typeface.DEFAULT
//                }
//            }
//            try {
//                setTextColor(element.getString("color").toColorInt())
//            } catch (e: Exception) {
//                Log.e(TAG, "Error parsing color: ${element.optString("color")}", e)
//                setTextColor(Color.WHITE)
//            }
//
//            // Optional formatting
//            gravity = Gravity.CENTER
//        }
//
//        // Step 1: Measure the TextView
//        textView.measure(
//            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED),
//            View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
//        )
////        val width = textView.measuredWidth.toDouble()
////        val height = textView.measuredHeight.toDouble()
//
//        // Step 2: Compute rotated bounding box
////        val angle = Math.toRadians(rotationDeg.toDouble())
////        val rotatedW = abs(width * cos(angle)) + abs(height * sin(angle))
////        val rotatedH = abs(width * sin(angle)) + abs(height * cos(angle))
//
//        // Step 3: Apply layout and container
////        textView.layoutParams = FrameLayout.LayoutParams(width.toInt(), height.toInt(), Gravity.CENTER)
//
////        return textView
//
//        return FrameLayout(context).apply {
////            layoutParams = FrameLayout.LayoutParams(rotatedW.toInt(), rotatedH.toInt())
//            layoutParams = FrameLayout.LayoutParams(width.toInt(), height.toInt())
//            addView(textView)
//            rotation = rotationDeg
//            clipChildren = false
//            clipToPadding = false
//            setBackgroundColor(Color.BLUE)
//            setPadding(0, 0, 0, 0)
//        }
//    }

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