package cm.vihautech.isyevent;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;
import android.app.PendingIntent;
import android.app.Activity;

import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.NdefMessage;

import android.support.v4.content.LocalBroadcastManager;
import android.content.Intent;
import android.content.Context;

import android.os.Handler;
import android.os.Bundle;
import android.os.Looper;
import android.os.Parcelable;

public class nfcCust extends CordovaPlugin {

  public static final String TAG = "nfc";

  NfcAdapter nfcAdapter;
  PendingIntent pendingIntent;
  Context context;

  public nfcCust() {

  }

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    Context context = cordova.getActivity().getApplicationContext();
    nfcAdapter = NfcAdapter.getDefaultAdapter(context);

    Activity activity = getActivity();
    Intent intent = new Intent(activity, activity.getClass());
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    pendingIntent = PendingIntent.getActivity(activity, 0, intent, 0);
  }

  @Override
  public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if ("Test".equals(action)) {

      // set callback to success
      callbackContext.success("Result from native Test");
      return true;
    }

    return true;
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    // setIntent(intent);
    resolveIntent(intent);
  }

  private void resolveIntent(Intent intent) {
    String action = intent.getAction();
    Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);

    if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) || NfcAdapter.ACTION_TECH_DISCOVERED.equals(action)
        || NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)) {
      Parcelable[] rawMsgs = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
      NdefMessage[] msgs;

    }

    // if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      nfcAdapter.ignore(tag, 1000, new NfcAdapter.OnTagRemovedListener() {
        @Override
        public void onTagRemoved() {

          Intent i = new Intent("iE_TagRemoved");
          // Bundle b = new Bundle();
          // b.putString("data", data);
          // i.putExtras(b);

          LocalBroadcastManager.getInstance(context).sendBroadcastSync(i);
        }

      }, new Handler(Looper.getMainLooper()));
    // }
  }

  private Activity getActivity() {
    return this.cordova.getActivity();
  }
}
