package com.tapbytapeya.app;

import android.os.Bundle;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Must run before super — hands Android 12+ system splash off to the activity theme.
        SplashScreen.installSplashScreen(this);
        registerPlugin(TapeyaBroadcastPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
