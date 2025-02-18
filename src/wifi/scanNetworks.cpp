#include <Arduino.h>
#include <WiFi.h>

String scanNetworks() {
  String json = "[";
  WiFi.scanDelete();
  int numNetworks = WiFi.scanNetworks();

  if(numNetworks >= 10) {
    numNetworks = 10; // memory issues
  }
  
  for (int i = 0; i < numNetworks; i++) {
    if (i > 0) json += ",";
    
    json += "{";
    json += "\"ssid\":\"" + WiFi.SSID(i) + "\",";
    json += "\"encryption\":" + String(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "false" : "true") + ",";
    
    // Classifica a força do sinal
    int rssi = WiFi.RSSI(i);
    String signalStrength;
    if (rssi >= -50) {
      signalStrength = "Strong";
    } else if (rssi >= -70) {
      signalStrength = "Good";
    } else if (rssi >= -60)
    {
      signalStrength = "Medium";
    } else {
      signalStrength = "Poor";
    }
    
    json += "\"signal\":\"" + signalStrength + "\"";
    json += "}";
  }
  
  json += "]";
  return json;
}