package com.naode.overlay.interfaces

interface OverlayStateManager {
    fun isScreenOff(): Boolean
    fun isServiceActive(): Boolean
    fun setScreenOff(isOff: Boolean)
    fun setServiceActive(isActive: Boolean)
} 