package com.tapbytapeya.app;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        TapeyaAppearancePlugin.applyStored(this);
        SplashBrandOverlay.warm(this);
        registerPlugin(TapeyaAppearancePlugin.class);
        registerPlugin(TapeyaBroadcastPlugin.class);
        registerPlugin(FacebookAnalyticsPlugin.class);
        super.onCreate(savedInstanceState);
        SplashBrandOverlay.show(this);
        // Cap's Android 12 mark stays until SplashScreen.hide; auto-hide waits on first
        // WebView predraw (~seconds). Drop it now so SplashBrandOverlay owns the brand.
        CapLaunchSplash.dismiss(this);
        getWindow().getDecorView().post(() -> {
            CapLaunchSplash.dismiss(this);
            SplashBrandOverlay.bringToFront(this);
        });
        // Hide OS nav early (before JS). Transient-by-swipe: edge swipe peeks then auto-hides.
        // Status bar stays visible. JS re-applies on resume via androidSystemNav.ts.
        applyHiddenAndroidNavigationBar();
        FacebookSdk.setAdvertiserIDCollectionEnabled(true);
        FacebookSdk.setAutoLogAppEventsEnabled(true);
        FacebookSdk.setAutoInitEnabled(true);
        FacebookSdk.fullyInitialize();
    }

    @Override
    public void onStart() {
        super.onStart();
        SplashBrandOverlay.bringToFront(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        applyHiddenAndroidNavigationBar();
        AppEventsLogger.activateApp(getApplication());
    }

    private void applyHiddenAndroidNavigationBar() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.navigationBars());
    }
}
