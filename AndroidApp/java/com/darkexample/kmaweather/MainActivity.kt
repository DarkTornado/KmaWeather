package com.darkexample.kmaweather

import android.app.Activity
import android.os.Bundle
import android.webkit.WebView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val web = WebView(this)
        web.loadUrl("file:///android_asset/hangul.html")
        setContentView(web);
    }
}