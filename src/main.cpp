#include <Arduino.h>
#include <DNSServer.h>
#include <SPIFFS.h>
#include <settings.h>
#include <pages/getPage.h>
#include <setups/setUpWebServer.h>
#include <setups/setUpDNSSServer.h>
#include <setups/setupWifiMode.h>
#include <setups/setupWifiScan.h>
#include <setups/setupNVS.h>
#include <nvs/getKey.h>
#include <globals.h>

const IPAddress localIP(LOCAL_IP);		   // the IP address the web server, Samsung requires the IP to be in public space
const IPAddress gatewayIP(GATEWAY_IP);		   // IP address of the network should be the same as the local IP for captive portals
const IPAddress subnetMask(SUBNET_MASK);  // no need to change: https://avinetworks.com/glossary/subnet-mask/

DNSServer dnsServer;
AsyncWebServer server(WEB_SERVER_PORT);

/*
	Verificar o arquivo de configuração
	Se estiver vazio
		-> Liga wifi
		-> Inicia webserver
		-> Roda Setup
			-> Configura Wifi
			-> Device Name (?)
			-> Gera GUID pro Device.
		-> Desliga webserver / wifi
	Se estiver com informação completa
		-> Tenta Conectar na rede configurada
*/

void print_reset_reason() {
    esp_reset_reason_t reason = esp_reset_reason();
    switch (reason) {
        case ESP_RST_POWERON: Serial.println("Reset due to power-on event"); break;
        case ESP_RST_EXT: Serial.println("Reset by external pin (not applicable for ESP32)"); break;
        case ESP_RST_SW: Serial.println("Software reset via esp_restart"); break;
        case ESP_RST_PANIC: Serial.println("Software reset due to exception/panic"); break;
        case ESP_RST_INT_WDT: Serial.println("Reset (software or hardware) due to interrupt watchdog"); break;
        case ESP_RST_TASK_WDT: Serial.println("Reset due to task watchdog"); break;
        case ESP_RST_WDT: Serial.println("Reset due to other watchdogs"); break;
        case ESP_RST_DEEPSLEEP: Serial.println("Reset after exiting deep sleep mode"); break;
        case ESP_RST_BROWNOUT: Serial.println("Brownout reset (software or hardware)"); break;
        case ESP_RST_SDIO: Serial.println("Reset over SDIO"); break;
        default: Serial.println("Unknown reset reason"); break;
    }
}


void setup() {
	// Set the transmit buffer size for the Serial object and start it with a baud rate of 115200.
	Serial.setTxBufferSize(1024);
	Serial.begin(115200);

	// Wait for the Serial object to become available.
	while (!Serial)
		;
	
	print_reset_reason();

	// Print a welcome message to the Serial port.
	Serial.println("\n\nIOT Boilerplate, V0.5.0 compiled " __DATE__ " " __TIME__ "\n");
	Serial.printf("%s-%d\n\r", ESP.getChipModel(), ESP.getChipRevision());

	setupNVS();

	char ssid[64];
	isConfigured = getKey("ssid", ssid);

	// Wifi Behavior
	setupWifiMode(localIP, gatewayIP);

	// WebServer configs
	setUpDNSServer(dnsServer, localIP);
	setUpWebServer(server, localIP);

	// Start SPIFFS (file system)
	if (!SPIFFS.begin(true)) {
		Serial.println("Failed to mount SPIFFS!");
		return;
	}

	Serial.print("Startup Time:");
	Serial.println(millis());
	Serial.print("\n");
}

void loop() {
	dnsServer.processNextRequest();
	delay(DNS_INTERVAL);	// seems to help with stability, if you are doing other things in the loop this may not be needed
}