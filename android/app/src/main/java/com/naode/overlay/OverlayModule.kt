package com.naode.overlay

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.util.Base64
import android.util.Log
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.core.graphics.get
import com.facebook.react.bridge.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import com.naode.utils.CommonUtil
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import androidx.core.graphics.createBitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode

class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val context: ReactApplicationContext = reactContext
    private var isModelDownloading = false
    private var isModelDownloaded = false

    companion object {
        private const val TAG = "OverlayModule"
    }

    override fun getName(): String {
        return "OverlayModule"
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise){
        promise.resolve(CommonUtil.checkAccessibilityPermission(context))
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise){
        CommonUtil.requestAccessibilityPermission(context)
        Toast.makeText(reactApplicationContext, "Please grant accessibility permission", Toast.LENGTH_SHORT).show()
    }

    @ReactMethod
    fun updateOverlay(promise: Promise) {
        try {
            // Get the service instance and call showOverlays
            val service = OverlayAccessibilityService()
            service.showOverlays()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error updating overlay", e)
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun triggerTickHaptic(){
        CommonUtil.triggerTickHaptic(reactApplicationContext)
    }

    @ReactMethod
    fun lockScreen() {
        CommonUtil.lockScreen(reactApplicationContext)
    }

    @ReactMethod
    fun removeAllOverlays(promise: Promise) {
        try {
            val service = OverlayAccessibilityService()
            service.removeOverlays()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing overlays", e)
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun preloadModel(promise: Promise) {
        if (isModelDownloaded) {
            promise.resolve(true)
            return
        }

        if (isModelDownloading) {
            promise.resolve(false)
            return
        }

        isModelDownloading = true
        val options = SubjectSegmenterOptions.Builder().enableForegroundBitmap().build()
        val segmenter = SubjectSegmentation.getClient(options)

        // Create a test image to trigger model download
        val testBitmap = createBitmap(51, 51)
        testBitmap.eraseColor(android.graphics.Color.WHITE)
        val testImage = InputImage.fromBitmap(testBitmap, 0)

        // Process the test image to trigger model download
        segmenter.process(testImage)
            .addOnSuccessListener {
                isModelDownloaded = true
                isModelDownloading = false
                Log.d(TAG, "Model downloaded successfully")
                promise.resolve(true)
            }
            .addOnFailureListener { e ->
                isModelDownloading = false
                Log.e(TAG, "Model download failed", e)
                if (e.message?.contains("Waiting for the subject segmentation") == true) {
                    // Model is still downloading, try again in a moment
                    promise.reject("MODEL_DOWNLOADING", "Model is still downloading, please try again in a moment")
                } else {
                    promise.reject("PRELOAD_FAILED", e.message)
                }
            }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    fun bitmapToBase64(bitmap: Bitmap, format: Bitmap.CompressFormat = Bitmap.CompressFormat.WEBP_LOSSY, quality: Int = 70): String {
        val byteArrayOutputStream = ByteArrayOutputStream()
        bitmap.compress(format, quality, byteArrayOutputStream)
        val byteArray = byteArrayOutputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.DEFAULT)
    }

    @RequiresApi(Build.VERSION_CODES.R)
    @ReactMethod
    fun removeBackground(imagePath: String, promise: Promise) {
        Log.d("ImageProcessor", "removeBackground called with imagePath: $imagePath")
        
        if (!isModelDownloaded && !isModelDownloading) {
            promise.reject("MODEL_NOT_READY", "Please wait while the model is being downloaded")
            return
        }

        // Remove file:/// prefix if it exists
        val cleanPath = if (imagePath.startsWith("file:///")) {
            imagePath.substring(7)
        } else {
            imagePath
        }
        val file = File(cleanPath)
        if (!file.exists()) {
            Log.e("ImageProcessor", "Image file not found at $cleanPath")
            promise.reject("FILE_NOT_FOUND", "Image file not found at $cleanPath")
            return
        } else {
            Log.d("ImageProcessor", "Image file found at $cleanPath")
        }

        val bitmap = BitmapFactory.decodeFile(cleanPath)
        val image = InputImage.fromBitmap(bitmap, 0)
        val options = SubjectSegmenterOptions.Builder().enableForegroundBitmap().build()
        val segmenter = SubjectSegmentation.getClient(options)
        Log.d("ImageProcessor", "Image process ready")

        processImage(segmenter, image, cleanPath, promise)
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun processImage(
        segmenter: com.google.mlkit.vision.segmentation.subject.SubjectSegmenter,
        image: InputImage,
        cleanPath: String,
        promise: Promise
    ) {
        segmenter.process(image)
            .addOnSuccessListener { result ->
                Log.d("ImageProcessor", "Image processed successfully")
                val colors = IntArray(image.width * image.height)
                val foregroundBitmap = result.foregroundBitmap
                if (foregroundBitmap != null) {
                    Log.d("ImageProcessor", "Foreground bitmap is not null")
                    for (y in 0 until foregroundBitmap.height) {
                        for (x in 0 until foregroundBitmap.width) {
                            val pixel = foregroundBitmap[x, y]
                            colors[y * foregroundBitmap.width + x] = pixel
                        }
                    }
                    val bitmapMask = Bitmap.createBitmap(
                        colors, foregroundBitmap.width, foregroundBitmap.height, Bitmap.Config.ARGB_8888
                    )
                    val base64String = bitmapToBase64(bitmapMask)
                    Log.d("ImageProcessor", "Base64 string: $base64String")

                    try {
                        val userImagesDir = File(context.filesDir, "user_images")
                        if (!userImagesDir.exists()) {
                            userImagesDir.mkdirs()
                        }
                        val stickerName = CommonUtil.getImageName(cleanPath)
                        val outputFile = File(userImagesDir, "${stickerName}_sticker.png")
                        bitmapMask.compress(Bitmap.CompressFormat.PNG, 100, FileOutputStream(outputFile))
                        Log.d("ImageProcessor", "Image saved to ${outputFile.absolutePath}")
                        promise.resolve(true)
                    } catch (e: Exception) {
                        Log.d("ImageProcessor", "Error saving image: $e")
                        promise.reject("SAVE_FAILED", e)
                    }
                } else {
                    Log.d("ImageProcessor", "Foreground bitmap is null")
                    promise.reject("PROCESSING_FAILED", "Failed to generate foreground bitmap")
                }
            }
            .addOnFailureListener { e ->
                Log.e("ImageProcessor", "Image processing failed", e)
                if (e.message?.contains("Waiting for the subject segmentation") == true) {
                    promise.reject("MODEL_NOT_READY", "Please wait while the model is being downloaded")
                } else {
                    promise.reject("PROCESSING_FAILED", e)
                }
            }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    @ReactMethod
    fun createCheckerboardPattern(imagePath: String, cellSize: Int, promise: Promise) {
        Log.d("ImageProcessor", "createCheckerboardPattern called with imagePath: $imagePath")
        
        // Remove file:/// prefix if it exists
        val cleanPath = if (imagePath.startsWith("file:///")) {
            imagePath.substring(7)
        } else {
            imagePath
        }
        val file = File(cleanPath)
        if (!file.exists()) {
            Log.e("ImageProcessor", "Image file not found at $cleanPath")
            promise.reject("FILE_NOT_FOUND", "Image file not found at $cleanPath")
            return
        }

        try {
            val bitmap = BitmapFactory.decodeFile(cleanPath)
            val width = bitmap.width
            val height = bitmap.height
            
            // Create a new bitmap with the same dimensions
            val resultBitmap = createBitmap(width, height)
            val canvas = Canvas(resultBitmap)
            
            // Draw the original image
            canvas.drawBitmap(bitmap, 0f, 0f, null)
            
            // Create checkerboard pattern
            val paint = Paint().apply {
                color = Color.TRANSPARENT
                xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
            }
            
            for (y in 0 until height step cellSize) {
                for (x in 0 until width step cellSize) {
                    if ((x / cellSize + y / cellSize) % 2 == 0) {
                        canvas.drawRect(
                            x.toFloat(),
                            y.toFloat(),
                            (x + cellSize).toFloat(),
                            (y + cellSize).toFloat(),
                            paint
                        )
                    }
                }
            }
            
            // Create output directory if it doesn't exist
            val outputDir = File(context.filesDir, "checkerboard")
            if (!outputDir.exists()) {
                outputDir.mkdirs()
            }
            
            // Save the result
            val outputFile = File(outputDir, "checkerboard_${System.currentTimeMillis()}.png")
            val outputStream = FileOutputStream(outputFile)
            resultBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            outputStream.flush()
            outputStream.close()
            
            // Clean up
            bitmap.recycle()
            resultBitmap.recycle()
            
            // Verify the file was written
            if (!outputFile.exists()) {
                throw Exception("Failed to write output file")
            }
            
            Log.d("ImageProcessor", "Checkerboard pattern saved to ${outputFile.absolutePath}")
            promise.resolve(outputFile.absolutePath)
        } catch (e: Exception) {
            Log.e("ImageProcessor", "Error creating checkerboard pattern", e)
            promise.reject("PROCESSING_FAILED", e)
        }
    }
} 