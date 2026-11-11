package com.tapbytapeya.app;

import android.os.Bundle;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.facebook.appevents.AppEventsLogger;

import org.json.JSONException;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.Iterator;

@CapacitorPlugin(name = "FacebookAnalytics")
public class FacebookAnalyticsPlugin extends Plugin {

    private AppEventsLogger logger;

    @Override
    public void load() {
        logger = AppEventsLogger.newLogger(getContext());
    }

    @PluginMethod
    public void logEvent(PluginCall call) {
        String eventName = call.getString("eventName");
        if (eventName == null) {
            call.reject("Missing eventName");
            return;
        }

        JSObject parameters = call.getObject("parameters", new JSObject());
        Double valueToSum = call.getDouble("valueToSum");
        Bundle bundle = jsObjectToBundle(parameters);

        if (valueToSum != null) {
            logger.logEvent(eventName, valueToSum, bundle);
        } else {
            logger.logEvent(eventName, bundle);
        }

        call.resolve();
    }

    @PluginMethod
    public void logPurchase(PluginCall call) {
        Double amount = call.getDouble("amount");
        String currency = call.getString("currency");

        if (amount == null || currency == null) {
            call.reject("Missing amount or currency");
            return;
        }

        JSObject parameters = call.getObject("parameters", new JSObject());
        Bundle bundle = jsObjectToBundle(parameters);

        logger.logPurchase(BigDecimal.valueOf(amount), Currency.getInstance(currency), bundle);
        call.resolve();
    }

    @PluginMethod
    public void flush(PluginCall call) {
        logger.flush();
        call.resolve();
    }

    private Bundle jsObjectToBundle(JSObject jsObject) {
        Bundle bundle = new Bundle();
        if (jsObject == null) return bundle;

        Iterator<String> keys = jsObject.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            try {
                Object value = jsObject.get(key);
                if (value instanceof String) {
                    bundle.putString(key, (String) value);
                } else if (value instanceof Integer) {
                    bundle.putInt(key, (Integer) value);
                } else if (value instanceof Double) {
                    bundle.putDouble(key, (Double) value);
                } else if (value instanceof Boolean) {
                    bundle.putBoolean(key, (Boolean) value);
                } else {
                    bundle.putString(key, value.toString());
                }
            } catch (JSONException e) {
                // skip unparseable parameter
            }
        }
        return bundle;
    }
}
