package com.naode.overlay.interfaces

import org.json.JSONObject

interface OverlayDataStore {
    fun getOverlayElements(): JSONObject
    fun saveOverlayElements(elements: JSONObject)
    fun clearOverlayElements()
    fun getScreensStore(): JSONObject
} 