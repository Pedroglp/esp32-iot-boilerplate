#include <nvs_flash.h>
#include <Arduino.h>

bool getKey(const char* keyName, char* keyOut) {
    nvs_handle_t nvsHandle;
    size_t keySize = 0;

    esp_err_t err = nvs_open("storage", NVS_READONLY, &nvsHandle);
    if (err != ESP_OK) {
        Serial.println("Error opening NVS handle!");
        switch(err) {
            case(ESP_FAIL):
                Serial.println("Corrupted NVS System");
            case(ESP_ERR_NVS_NO_FREE_PAGES ):
                Serial.println("No free pages");
            case(ESP_ERR_NOT_FOUND):
                Serial.println("NVS not found");
            case(ESP_ERR_NO_MEM):
                Serial.println("No memory available");
            default:
                Serial.println("Unknown error");
        }
        return false;
    }

    // gets the size from variable stored at NVS
    err = nvs_get_str(nvsHandle, keyName, NULL, &keySize);
    if (err != ESP_OK) {
        Serial.print("Error loading: ");
        Serial.println(keyName);
        switch(err) {
            case(ESP_FAIL):
                Serial.println("Corrupted NVS System");
                break;
            case(ESP_ERR_NVS_NOT_FOUND):
                Serial.println("Key ssid not found");
                break;
            case(ESP_ERR_NVS_INVALID_HANDLE):
                Serial.println("Invalid Handle or Handle Closed");
                break;
            case(ESP_ERR_NVS_INVALID_NAME):
                Serial.println("Invalid Key Name");
                break;
            case(ESP_ERR_NVS_INVALID_LENGTH):
                Serial.println("Invalid Key Length");
                break;
            default:
                Serial.println("Unknown error: "+err);
                break;
        }
        nvs_close(nvsHandle);
        return false;
    }

    // if 0, there is nothing stored    
    if(keySize == 0) {
        Serial.print("Unknown error: ");
        Serial.println(keyName);
        nvs_close(nvsHandle);
        return false;
    } else {
        char* key = (char*) malloc(keySize +1);
        err = nvs_get_str(nvsHandle, keyName, key, &keySize);
        strcpy(keyOut, key);
        free(key);
    }

    nvs_close(nvsHandle);
    return true;
}