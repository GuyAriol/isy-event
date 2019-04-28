package cm.vihautech.isyevent;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;

public class bluetooth extends CordovaPlugin {

  public static final String TAG = "bluetooth";
  String id;
  JSONObject data;

  private String discoveredDevices;
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
        cordova.getActivity().startActivityForResult(enableIntent, 1);
      }

      else {

      }

      // set callback to success
      callbackContext.success("Result from native activateBluetooth");
      return true;
    }

    else if ("startScan".equals(action)) {
      if (bluetoothAdapter.isDiscovering()) {
        bluetoothAdapter.cancelDiscovery();
      }

      bluetoothAdapter.startDiscovery();

      Context context = cordova.getActivity().getApplicationContext();

      // Register for broadcasts when a device is discovered
      IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
      context.registerReceiver(discoveryFinishReceiver, filter);

      // Register for broadcasts when discovery has finished
      filter = new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
      context.registerReceiver(discoveryFinishReceiver, filter);

      bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
      Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();

      JSONObject out = new JSONObject();
      Integer i = 0;

      // If there are paired devices, add each one to the ArrayAdapter
      if (pairedDevices.size() > 0) {
        for (BluetoothDevice device : pairedDevices) {
          Log.i(TAG, "paired: " + device.getName() + " " + device.getAddress());
          discoveredDevices += device.getName() + " " + device.getAddress() + " " + "paired" + ";";

          JSONObject temp = new JSONObject();

          temp.put("name", device.getName());
          temp.put("address", device.getAddress());
          out.put(String.valueOf(i), temp);
          i++;
        }
      }

      else {
        Log.i(TAG, "no paired devices");
      }

      // set callback to success
      callbackContext.success(out);
      return true;
    }

    if ("stopScan".equals(action)) {
      bluetoothAdapter.cancelDiscovery();

      // set callback to success
      callbackContext.success("Result from native stopScan");
      return true;
    }

    return true;
  }

  private final BroadcastReceiver discoveryFinishReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();

      if (BluetoothDevice.ACTION_FOUND.equals(action)) {
        BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
        if (device.getBondState() != BluetoothDevice.BOND_BONDED) {
          Log.i(TAG, "new device detected" + device.getName() + " " + device.getAddress());

          // toDo: broadcast device detected
        }
      }

      else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
        Log.i(TAG, "scanning done");
        // toDo: broadcast scanning done
      }
    }
  };
}
