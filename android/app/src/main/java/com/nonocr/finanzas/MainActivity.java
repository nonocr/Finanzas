package com.nonocr.finanzas;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // De borde a borde en todas las versiones de Android: la app pinta detrás de las barras del sistema y respeta
        // las zonas seguras con env(safe-area-inset-*), como en iPhone (ver SystemBars en capacitor.config.ts).
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
    }
}
