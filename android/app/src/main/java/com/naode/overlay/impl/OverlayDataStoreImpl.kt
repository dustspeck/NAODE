package com.naode.overlay.impl

import android.content.Context
import com.naode.overlay.interfaces.OverlayDataStore
import com.tencent.mmkv.MMKV
import org.json.JSONObject
import android.util.Log

class OverlayDataStoreImpl(context: Context) : OverlayDataStore {
    private val TAG = "OverlayDataStoreImpl"
    private val mmkvId = "mmkv_id"
    private val editorStoreKey = "EDITOR_STORE"
    private val defaultStoreJSONString = "{\"elements\":[]}"
    
    private val mmkv: MMKV by lazy {
        try {
            MMKV.initialize(context)
            MMKV.mmkvWithID(mmkvId, MMKV.MULTI_PROCESS_MODE)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing MMKV", e)
            throw e
        }
    }

    override fun getOverlayElements(): JSONObject {
        return try {
            val storeJson = mmkv.getString(editorStoreKey, defaultStoreJSONString)
            JSONObject(storeJson)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting overlay elements", e)
            JSONObject(defaultStoreJSONString)
        }
    }

    override fun saveOverlayElements(elements: JSONObject) {
        try {
            mmkv.putString(editorStoreKey, elements.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Error saving overlay elements", e)
            throw e
        }
    }

    override fun clearOverlayElements() {
        try {
            mmkv.putString(editorStoreKey, defaultStoreJSONString)
        } catch (e: Exception) {
            Log.e(TAG, "Error clearing overlay elements", e)
            throw e
        }
    }
} 