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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

import android.os.Handler;
import android.os.Message;
import android.os.Bundle;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.BroadcastReceiver;

import android.widget.Toast;

import android.support.v4.content.LocalBroadcastManager;

public class bluetooth extends CordovaPlugin {

  public static final String TAG = "bluetooth";
  String id;
  JSONObject data;

  private String discoveredDevices;
  private BluetoothAdapter bluetoothAdapter;
  private BluetoothDevice connectingDevice;
  private Context context;

  // --------------------------
  private static final String APP_NAME = "isy Event";
  private static final UUID MY_UUID = UUID.fromString("8ce255c0-200a-11e0-ac64-0800200c9a66");
  public static final int MESSAGE_STATE_CHANGE = 1;
  public static final int MESSAGE_READ = 2;
  public static final int MESSAGE_WRITE = 3;
  public static final int MESSAGE_DEVICE_OBJECT = 4;
  public static final int MESSAGE_TOAST = 5;
  public static final String DEVICE_OBJECT = "device_name";

  private int state;
  static final int STATE_NONE = 0;
  static final int STATE_LISTEN = 1;
  static final int STATE_CONNECTING = 2;
  static final int STATE_CONNECTED = 3;

  private ConnectThread connectThread;
  private ReadWriteThread connectedThread;
  private AcceptThread acceptThread;
  // --------------------------

  public bluetooth() {

  }

  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    context = cordova.getActivity().getApplicationContext();
  }

  // -------------------

  // initiate connection to remote device
  public synchronized void connect(BluetoothDevice device) {
    // Cancel any thread
    if (state == STATE_CONNECTING) {
      if (connectThread != null) {
        connectThread.cancel();
        connectThread = null;
      }
    }

    // Cancel running thread
    if (connectedThread != null) {
      connectedThread.cancel();
      connectedThread = null;
    }

    // Start the thread to connect with the given device
    connectThread = new ConnectThread(device);
    connectThread.start();
    setState(STATE_CONNECTING);
  }

  // Set the current state of the chat connection
  private synchronized void setState(int state) {
    this.state = state;

    handler.obtainMessage(MESSAGE_STATE_CHANGE, state, -1).sendToTarget();
  }

  private void connectionFailed() {
    Message msg = handler.obtainMessage(MESSAGE_TOAST);
    Bundle bundle = new Bundle();
    bundle.putString("toast", "Unable to connect device");
    msg.setData(bundle);
    handler.sendMessage(msg);

    // Start the service over to restart listening mode
    start();
  }

  // start service
  public synchronized void start() {
    // Cancel any thread
    if (connectThread != null) {
      connectThread.cancel();
      connectThread = null;
    }

    // Cancel any running thresd
    if (connectedThread != null) {
      connectedThread.cancel();
      connectedThread = null;
    }

    state = STATE_LISTEN;

    if (acceptThread == null) {
      acceptThread = new AcceptThread();
      acceptThread.start();
    }
  }

  // manage Bluetooth connection
  public synchronized void connected(BluetoothSocket socket, BluetoothDevice device) {
    // Cancel the thread
    if (connectThread != null) {
      connectThread.cancel();
      connectThread = null;
    }

    // Cancel running thread
    if (connectedThread != null) {
      connectedThread.cancel();
      connectedThread = null;
    }

    if (acceptThread != null) {
      acceptThread.cancel();
      acceptThread = null;
    }

    // Start the thread to manage the connection and perform transmissions
    connectedThread = new ReadWriteThread(socket);
    connectedThread.start();

    // Send the name of the connected device back to the UI Activity
    Message msg = handler.obtainMessage(MESSAGE_DEVICE_OBJECT);
    Bundle bundle = new Bundle();
    bundle.putParcelable(DEVICE_OBJECT, device);
    msg.setData(bundle);
    handler.sendMessage(msg);

    setState(STATE_CONNECTED);
  }

  private void connectionLost() {
    Message msg = handler.obtainMessage(MESSAGE_TOAST);
    Bundle bundle = new Bundle();
    bundle.putString("toast", "Device connection was lost");
    msg.setData(bundle);
    handler.sendMessage(msg);

    // Start the service over to restart listening mode
    start();
  }

  // runs while attempting to make an outgoing connection
  private class ConnectThread extends Thread {
    private final BluetoothSocket socket;
    private final BluetoothDevice device;

    public ConnectThread(BluetoothDevice device) {
      this.device = device;
      BluetoothSocket tmp = null;
      try {
        tmp = device.createInsecureRfcommSocketToServiceRecord(MY_UUID);
      } catch (IOException e) {
        e.printStackTrace();
      }
      socket = tmp;
    }

    public void run() {
      Log.i(TAG, "--ConnectThread-run");
      setName("ConnectThread");

      // Always cancel discovery because it will slow down a connection
      bluetoothAdapter.cancelDiscovery();

      // Make a connection to the BluetoothSocket
      try {
        socket.connect();
        Log.i(TAG, "socket connect PASS");
      } catch (IOException e) {
        Log.i(TAG, "socket connect FAIL 1");
        Log.i(TAG, e);
        try {
          socket.close();
        } catch (IOException e2) {
          Log.i(TAG, "socket connect FAIL 2");
        }
        connectionFailed();
        return;
      }

      // Reset the ConnectThread because we're done
      synchronized (this) {
        connectThread = null;
      }

      // Start the connected thread
      connected(socket, device);
    }

    public void cancel() {
      try {
        socket.close();
      } catch (IOException e) {
      }
    }
  }

  // runs during a connection with a remote device
  private class ReadWriteThread extends Thread {
    private final BluetoothSocket bluetoothSocket;
    private final InputStream inputStream;
    private final OutputStream outputStream;

    public ReadWriteThread(BluetoothSocket socket) {
      this.bluetoothSocket = socket;
      InputStream tmpIn = null;
      OutputStream tmpOut = null;

      try {
        tmpIn = socket.getInputStream();
        tmpOut = socket.getOutputStream();
      } catch (IOException e) {
      }

      inputStream = tmpIn;
      outputStream = tmpOut;
    }

    public void run() {
      byte[] buffer = new byte[1024];
      int bytes;

      // Keep listening to the InputStream
      while (true) {
        try {
          // Read from the InputStream
          bytes = inputStream.read(buffer);

          // Send the obtained bytes to the UI Activity
          handler.obtainMessage(MESSAGE_READ, bytes, -1, buffer).sendToTarget();
        } catch (IOException e) {
          connectionLost();
          // Start the service over to restart listening mode
          start();
          break;
        }
      }
    }

    // write to OutputStream
    public void write(byte[] buffer) {
      try {
        outputStream.write(buffer);
        handler.obtainMessage(MESSAGE_WRITE, -1, -1, buffer).sendToTarget();
      } catch (IOException e) {
      }
    }

    public void cancel() {
      try {
        bluetoothSocket.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }

  // runs while listening for incoming connections
  private class AcceptThread extends Thread {
    private final BluetoothServerSocket serverSocket;

    public AcceptThread() {
      BluetoothServerSocket tmp = null;
      try {
        tmp = bluetoothAdapter.listenUsingInsecureRfcommWithServiceRecord(APP_NAME, MY_UUID);
      } catch (IOException ex) {
        ex.printStackTrace();
      }
      serverSocket = tmp;
    }

    public void run() {
      setName("AcceptThread");
      BluetoothSocket socket;
      while (state != STATE_CONNECTED) {
        try {
          socket = serverSocket.accept();
        } catch (IOException e) {
          break;
        }

        // If a connection was accepted
        if (socket != null) {
          synchronized (bluetooth.this) {
            switch (state) {
            case STATE_LISTEN:
            case STATE_CONNECTING:
              // start the connected thread.
              connected(socket, socket.getRemoteDevice());
              break;
            case STATE_NONE:
            case STATE_CONNECTED:
              // Either not ready or already connected. Terminate
              // new socket.
              try {
                socket.close();
              } catch (IOException e) {
              }
              break;
            }
          }
        }
      }
    }

    public void cancel() {
      try {
        serverSocket.close();
      } catch (IOException e) {
      }
    }
  }
  // -------------------

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

    else if ("stopScan".equals(action)) {
      bluetoothAdapter.cancelDiscovery();

      // set callback to success
      callbackContext.success("Result from native stopScan");
      return true;
    }

    else if ("connect".equals(action)) {
      String deviceAddress = args.getJSONObject(0).getString("address");

      bluetoothAdapter.cancelDiscovery();
      BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceAddress);
      connect(device);
    }

    return true;
  }

  private void setStatus(String s) {
    // toDo: feedback ionic
    // status.setText(s);
  }

  private void notifyIonic(String eventName, String data) {
    Intent i = new Intent(eventName);
    Bundle b = new Bundle();
    b.putString("data", data);
    i.putExtras(b);

    LocalBroadcastManager.getInstance(context).sendBroadcastSync(i);
  }

  private Handler handler = new Handler(new Handler.Callback() {

    @Override
    public boolean handleMessage(Message msg) {
      switch (msg.what) {
      case MESSAGE_STATE_CHANGE:
        switch (msg.arg1) {
        case STATE_CONNECTED:
          setStatus("Connected to: " + connectingDevice.getName());

          notifyIonic("device-connected", connectingDevice.getName());
          break;
        case STATE_CONNECTING:
          setStatus("Connecting...");

          // toDo: feedback to ionic
          // btnConnect.setEnabled(false);
          break;
        case STATE_LISTEN:
        case STATE_NONE:
          setStatus("Not connected");
          break;
        }
        break;
      case MESSAGE_WRITE:
        byte[] writeBuf = (byte[]) msg.obj;

        String writeMessage = new String(writeBuf);

        // toDo: enable
        // chatMessages.add("Me: " + writeMessage);
        // chatAdapter.notifyDataSetChanged();
        break;
      case MESSAGE_READ:
        byte[] readBuf = (byte[]) msg.obj;

        String readMessage = new String(readBuf, 0, msg.arg1);

        // toDo: enable
        // chatMessages.add(connectingDevice.getName() + ": " + readMessage);
        // chatAdapter.notifyDataSetChanged();
        break;
      case MESSAGE_DEVICE_OBJECT:
        connectingDevice = msg.getData().getParcelable(DEVICE_OBJECT);
        Toast.makeText(cordova.getActivity().getApplicationContext(), "Connected to " + connectingDevice.getName(),
            Toast.LENGTH_SHORT).show();
        break;
      case MESSAGE_TOAST:
        Toast.makeText(cordova.getActivity().getApplicationContext(), msg.getData().getString("toast"),
            Toast.LENGTH_SHORT).show();
        break;
      }
      return false;
    }
  });

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
