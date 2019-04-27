package cm.vihautech.isyevent;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;

public class bluetooth extends CordovaPlugin {

  public static final String TAG = "bluetooth";
  String id;
  JSONObject data;

  private BluetoothAdapter bluetoothAdapter;

  public bluetooth() {

  }

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
  }

  @Override
  public boolean execute(final String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if ("Test".equals(action)) {

      // toDo: remove tel from argument
      try {
        id = args.getJSONObject(0).getString("id");

        Log.i(TAG, id);

      } catch (JSONException e) {
        Log.e(TAG, "ERROR creating JSON");
      }

      // set callback to success
      callbackContext.success("Result from native Test");
      return true;
    }

    else if ("activateBluetooth".equals(action)) {
      if (!bluetoothAdapter.isEnabled()) {
        Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        startActivityForResult(enableIntent, 1);
      }

      else {

      }
    }

    return true;
  }
}
