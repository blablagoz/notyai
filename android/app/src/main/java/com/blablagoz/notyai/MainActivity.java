package com.blablagoz.notyai;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeDevicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
