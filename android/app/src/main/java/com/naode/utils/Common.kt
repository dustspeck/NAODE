package com.naode.utils

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.Settings
import android.text.TextUtils
import android.util.Log
import com.naode.overlay.OverlayAccessibilityService


object CommonUtil {
    fun checkAccessibilityPermission(context: Context): Boolean {
        return try {
            val fullServiceName = "${context.packageName}/${OverlayAccessibilityService::class.java.name}"
            val altServiceName = "${context.packageName}/.${OverlayAccessibilityService::class.java.name.removePrefix(context.packageName + ".")}"

            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            val colonSplitter = TextUtils.SimpleStringSplitter(':')
            colonSplitter.setString(enabledServices)

            while (colonSplitter.hasNext()) {
                val componentName = colonSplitter.next()
                if (
                    componentName.equals(fullServiceName, ignoreCase = true) || componentName.equals(altServiceName, ignoreCase = true)
                ) {
                    return true
                }
            }

            // Fallback to Settings.Secure check
            val enabledServicesString = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: run {
                Log.d("CommonUtil", "No enabled accessibility services found")
                return false
            }

            colonSplitter.setString(enabledServicesString)

            val isEnabledInSettings = colonSplitter.any { componentName ->
                componentName.equals(fullServiceName, ignoreCase = true) || componentName.equals(altServiceName, ignoreCase = true)
            }

            if (isEnabledInSettings) {
                Log.d("CommonUtil", "Accessibility service is enabled via Settings.Secure")
            } else {
                Log.d("CommonUtil", "Accessibility service is not enabled")
            }

            isEnabledInSettings
        } catch (e: Exception) {
            Log.e("CommonUtil", "Error checking accessibility permission: ${e.message}")
            false
        }
    }

    fun requestAccessibilityPermission(context: Context) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            context.startActivity(intent)
            Log.d("CommonUtil", "Requested accessibility permission")
        } catch (e: Exception) {
            Log.e("CommonUtil", "Error requesting accessibility permission: ${e.message}")
            // Fallback to general settings
            try {
                val intent = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                Log.e("CommonUtil", "Error opening settings: ${e.message}")
            }
        }
    }

    fun triggerTickHaptic(context: Context) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK))
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(20, VibrationEffect.DEFAULT_AMPLITUDE))
        } else vibrator.vibrate(20)
    }

    fun lockScreen(context: Context){
        val intent = Intent(context, OverlayAccessibilityService::class.java)
        intent.action = "LOCK_SCREEN"
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startService(intent)
    }

    fun getImageName(uri: String): String {
        val name = uri.split('/').last().split('.').first()
        return name
    }
}