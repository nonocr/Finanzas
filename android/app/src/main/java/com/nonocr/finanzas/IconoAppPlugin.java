package com.nonocr.finanzas;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Arrays;
import java.util.List;

/**
 * Ícono de la app a juego con el tema. Cada ícono es un <activity-alias> del lanzador en AndroidManifest.xml
 * (todos apuntan a MainActivity) y solo uno está encendido.
 *
 * El cambio se aplica cuando la app pasa a segundo plano (onStop): cambiar el componente del lanzador con la app
 * abierta hace que algunos lanzadores la cierren en la cara de la persona.
 */
@CapacitorPlugin(name = "IconoApp")
public class IconoAppPlugin extends Plugin {

    private static final List<String> ALIAS = Arrays.asList("Negra", "Titanio", "Oro", "OroRosa", "Zafiro", "Esmeralda");

    private String pendiente;

    @PluginMethod
    public void cambiar(PluginCall call) {
        String nombre = call.getString("nombre");
        if (nombre == null) nombre = "Negra";
        if (!ALIAS.contains(nombre)) {
            call.reject("Ícono desconocido: " + nombre);
            return;
        }
        pendiente = nombre;
        JSObject r = new JSObject();
        r.put("cambiado", true);
        call.resolve(r);
    }

    @Override
    protected void handleOnStop() {
        super.handleOnStop();
        if (pendiente == null) return;
        String nombre = pendiente;
        pendiente = null;
        PackageManager pm = getContext().getPackageManager();
        // Primero se enciende el nuevo y después se apagan los demás: la app nunca queda sin ícono.
        activar(pm, nombre, true);
        for (String a : ALIAS) {
            if (!a.equals(nombre)) activar(pm, a, false);
        }
    }

    private void activar(PackageManager pm, String alias, boolean encendido) {
        // El paquete instalado (applicationId) y el de las clases (namespace) pueden ser distintos.
        ComponentName c = new ComponentName(getContext().getPackageName(), MainActivity.class.getPackage().getName() + "." + alias);
        int estado = encendido ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
        if (pm.getComponentEnabledSetting(c) != estado) {
            pm.setComponentEnabledSetting(c, estado, PackageManager.DONT_KILL_APP);
        }
    }
}
