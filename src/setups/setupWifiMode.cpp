#include <setups/setupWifiMode.h>
#include <settings.h>
#include <esp_wifi.h>			//Used for mpdu_rx_disable android workaround
#include <ESPAsyncWebServer.h>	//https://github.com/me-no-dev/ESPAsyncWebServer using the latest dev version from @me-no-dev
#include <globals.h>
#include <nvs/getKey.h>
#include <setups/setupWifiScan.h>

void setupWifiMode(const IPAddress &localIP, const IPAddress &gatewayIP) {

	if(isConfigured) {
		Serial.println("Device has Wifi configured");

		char ssid[64];
		char password[64];

		isConfigured = getKey("ssid", ssid);
		getKey("password", password);

		WiFi.mode(WIFI_STA);

		
		WiFi.begin(ssid, password);
		Serial.print("Trying to connhect to: ");
		Serial.println(ssid);
		while (WiFi.status() != WL_CONNECTED) {
			unsigned long startTime = millis();
			if (millis() - startTime >= WIFI_TIMEOUT) {
				Serial.println("\nConnection attempt timed out.");
				WiFi.disconnect(true);
				break;
			}
			delay(1000);
			Serial.print(".");
			vTaskDelay(1 / portTICK_PERIOD_MS);
		}
		Serial.println("\nDevice Connected!\nIP: "+WiFi.localIP().toString());
	} else {
		// If it is not configured we need to setup a AP + Scan Wifis
		const char *ssid = WIFI_SSID;
    	const char *password = WIFI_PASSWORD;
		// Set the WiFi mode to access point and station
		WiFi.mode(WIFI_AP_STA);
		
		// Define the subnet mask for the WiFi network
		const IPAddress subnetMask(SUBNET_MASK);

		// Configure the soft access point with a specific IP and subnet mask
		WiFi.softAPConfig(localIP, gatewayIP, subnetMask);

		// Start the soft access point with the given ssid, password, channel, max number of clients
		WiFi.softAP(ssid, password, WIFI_CHANNEL, 0, MAX_CLIENTS);

		// Disable AMPDU RX on the ESP32 WiFi to fix a bug on Android
		esp_wifi_stop();
		esp_wifi_deinit();
		wifi_init_config_t my_config = WIFI_INIT_CONFIG_DEFAULT();
		my_config.ampdu_rx_enable = false;
		esp_wifi_init(&my_config);
		esp_wifi_start();
		vTaskDelay(150 / portTICK_PERIOD_MS);  // Add a small delay
		setupWiFiScan();

	}
}