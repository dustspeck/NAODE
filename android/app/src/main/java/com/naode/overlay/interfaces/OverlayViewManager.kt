package com.naode.overlay.interfaces

import android.view.View
import android.view.WindowManager
import org.json.JSONObject

interface OverlayViewManager {
    fun createView(element: JSONObject): View
    fun addView(view: View, params: WindowManager.LayoutParams)
    fun removeView(view: View)
    fun removeAllViews()
} 