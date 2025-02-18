#include <nvs_flash.h>
#include <Arduino.h>

void setWifiCredentials(const char* ssid, const char* password) {
    nvs_handle_t nvsHandle;
    esp_err_t err = nvs_open("storage", NVS_READWRITE, &nvsHandle);
    if (err != ESP_OK) {
        Serial.println("Error opening NVS handle!");
        return;
    }

    // Save SSID
    err = nvs_set_str(nvsHandle, "ssid", ssid);
    if (err != ESP_OK) {
        Serial.println("Error saving SSID!");
    }

    // Save Password
    err = nvs_set_str(nvsHandle, "password", password);
    if (err != ESP_OK) {
        Serial.println("Error saving password!");
    }

    // Commit changes
    err = nvs_commit(nvsHandle);
    if (err != ESP_OK) {
        Serial.println("Error committing NVS changes!");
    }

    nvs_close(nvsHandle);
}