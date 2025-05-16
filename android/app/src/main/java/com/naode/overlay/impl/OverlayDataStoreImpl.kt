package com.naode.overlay.impl

import android.content.Context
import com.naode.overlay.interfaces.OverlayDataStore
import com.tencent.mmkv.MMKV
import org.json.JSONObject
import android.util.Log

class OverlayDataStoreImpl(context: Context) : OverlayDataStore {
    private val TAG = "OverlayDataStoreImpl"
    private val MMKV_ID = "mmkv_id"
    private val EDITOR_STORE_KEY = "EDITOR_STORE"
    private val DEFAULT_STORE_JSON = "{\"elements\":[]}"
    
    private val mmkv: MMKV by lazy {
        try {
            MMKV.initialize(context)
            MMKV.mmkvWithID(MMKV_ID, MMKV.MULTI_PROCESS_MODE)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing MMKV", e)
            throw e
        }
    }

    override fun getOverlayElements(): JSONObject {
        return try {
            val storeJson = mmkv.getString(EDITOR_STORE_KEY, DEFAULT_STORE_JSON)
            JSONObject(storeJson)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting overlay elements", e)
            JSONObject(DEFAULT_STORE_JSON)
        }
    }

    override fun saveOverlayElements(elements: JSONObject) {
        try {
            mmkv.putString(EDITOR_STORE_KEY, elements.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Error saving overlay elements", e)
            throw e
        }
    }

    override fun clearOverlayElements() {
        try {
            mmkv.putString(EDITOR_STORE_KEY, DEFAULT_STORE_JSON)
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing overlay elements", e)
            throw e
        }
    }
} 