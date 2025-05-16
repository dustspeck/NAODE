package com.naode.overlay.impl

import com.naode.overlay.interfaces.OverlayStateManager
import java.util.concurrent.atomic.AtomicBoolean

class OverlayStateManagerImpl : OverlayStateManager {
    private val isScreenOff = AtomicBoolean(false)
    private val isServiceActive = AtomicBoolean(false)

    override fun isScreenOff(): Boolean = isScreenOff.get()
    
    override fun isServiceActive(): Boolean = isServiceActive.get()
    
    override fun setScreenOff(isOff: Boolean) {
        isScreenOff.set(isOff)
    }
    
    override fun setServiceActive(isActive: Boolean) {
        isServiceActive.set(isActive)
    }
} 