#include <WiFi.h>
#include <globals.h>
#include <esp_heap_caps.h>

void scanWiFis(void *parameter) {
  while (1) {
    totalWifiScanned = WiFi.scanNetworks();
    vTaskDelay(5000 / portTICK_PERIOD_MS); // 5 seconds
  }
}

void setupWiFiScan() {
    SemaphoreHandle_t scanMutex;
    scanMutex = xSemaphoreCreateMutex();

    xTaskCreate(
        scanWiFis,
        "Scan WiFis",
        4096,
        NULL,
        1,         
        NULL
    );
}