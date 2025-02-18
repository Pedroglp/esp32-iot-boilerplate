#include <ESPAsyncWebServer.h>	//https://github.com/me-no-dev/ESPAsyncWebServer using the latest dev version from @me-no-dev
#include <settings.h>
#include <pages/getPage.h>
#include <SPIFFS.h>
#include <esp_system.h>
#include <wifi/scanNetworks.h>
#include <wifi/setWifiCredentials.h>
#include <globals.h>
#include <ArduinoJson.h>

void setUpWebServer(AsyncWebServer &server, const IPAddress &localIP) {
    // Pre reading on the fundamentals of captive portals https://textslashplain.com/2022/06/24/captive-portals/
	//======================== Webserver ========================
	// WARNING IOS (and maybe macos) WILL NOT POP UP IF IT CONTAINS THE WORD "Success" https://www.esp8266.com/viewtopic.php?f=34&t=4398
	// SAFARI (IOS) IS STUPID, G-ZIPPED FILES CAN'T END IN .GZ https://github.com/homieiot/homie-esp8266/issues/476 this is fixed by the webserver serve static function.
	// SAFARI (IOS) there is a 128KB limit to the size of the HTML. The HTML can reference external resources/images that bring the total over 128KB
	// SAFARI (IOS) popup browser has some severe limitations (javascript disabled, cookies disabled)

    const String localIPURL = "http://" + String(IP_PART_1) + "." + String(IP_PART_2) + "." + String(IP_PART_3) + "." + String(IP_PART_4);	 // a string version of the local IP with http, used for redirecting clients to your webpage

	// Required
	server.on("/connecttest.txt", [](AsyncWebServerRequest *request) { request->redirect("http://logout.net"); });	// windows 11 captive portal workaround
	server.on("/wpad.dat", [](AsyncWebServerRequest *request) { request->send(404); });								// Honestly don't understand what this is but a 404 stops win 10 keep calling this repeatedly and panicking the esp32 :)

	// Background responses: Probably not all are Required, but some are. Others might speed things up?
	// A Tier (commonly used by modern systems)
	server.on("/generate_204", [localIPURL](AsyncWebServerRequest *request) { request->redirect(localIPURL); });		   // android captive portal redirect
	server.on("/redirect", [localIPURL](AsyncWebServerRequest *request) { request->redirect(localIPURL); });			   // microsoft redirect
	server.on("/hotspot-detect.html", [localIPURL](AsyncWebServerRequest *request) { request->redirect(localIPURL); });  // apple call home
	server.on("/canonical.html", [localIPURL](AsyncWebServerRequest *request) { request->redirect(localIPURL); });	   // firefox captive portal call home
	server.on("/success.txt", [localIPURL](AsyncWebServerRequest *request) { request->send(200); });					   // firefox captive portal call home
	server.on("/ncsi.txt", [localIPURL](AsyncWebServerRequest *request) { request->redirect(localIPURL); });			   // windows call home

	// B Tier (uncommon)
	//  server.on("/chrome-variations/seed",[](AsyncWebServerRequest *request){request->send(200);}); //chrome captive portal call home
	//  server.on("/service/update2/json",[](AsyncWebServerRequest *request){request->send(200);}); //firefox?
	//  server.on("/chat",[](AsyncWebServerRequest *request){request->send(404);}); //No stop asking Whatsapp, there is no internet connection
	//  server.on("/startpage",[](AsyncWebServerRequest *request){request->redirect(localIPURL);});

	// return 404 to webpage icon
	server.on("/favicon.ico", [](AsyncWebServerRequest *request) { request->send(404); });	// webpage icon

	// Serve Basic HTML Page
	server.on("/", HTTP_ANY, [](AsyncWebServerRequest *request) {
		if(SPIFFS.exists("/index.html")) {
			AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.html", "text/html");
			request->send(response);
		} else {
			Serial.println("Style file not found");
			request->send(404, "text/plain", "File not found");
		}
	});

	server.on("/style.css", HTTP_ANY, [](AsyncWebServerRequest *request) {
		Serial.println("\nServed Style Css");

		if(SPIFFS.exists("/style.css")) {
			AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/style.css", "text/css");
			request->send(response);
		} else {
			Serial.println("Style file not found");
			request->send(404, "text/plain", "File not found");
		}
	});

	// Serve files in /assets
	server.on("/assets/*", HTTP_GET, [](AsyncWebServerRequest *request){
		String path = request->url();
		if(SPIFFS.exists(path)){
			AsyncWebServerResponse *response = request->beginResponse(SPIFFS, path, String(), true);
			request->send(response);
		} else {
			request->send(404, "text/plain", "File not found");
		}
	});

	server.on("/script.js", HTTP_GET, [](AsyncWebServerRequest *request) {
		Serial.println("\nServed JS");

		if(SPIFFS.exists("/script.js")) {
			request->send(SPIFFS, "/script.js", "application/javascript");
		} else {
			Serial.println("JS file not found");
			request->send(404, "text/plain", "File not found");
		}

	});

	server.on("/wifi-list", HTTP_GET, [](AsyncWebServerRequest *request){
			AsyncResponseStream *response = request->beginResponseStream("application/json");
			response->print("[");
			for (int i = 0; i < totalWifiScanned; i++) {
				if (i > 0) response->print(",");
				response->print("{");
				response->print("\"ssid\":\"" + WiFi.SSID(i) + "\",");
				response->print("\"encryption\":" + String(WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "false" : "true") + ",");
				response->print("\"signal\":\"" + String(WiFi.RSSI(i)) + "\"");
				response->print("}");
			}
			response->print("]");
			request->send(response);
	});

	server.on("/wifi-connect", HTTP_POST, [](AsyncWebServerRequest *request){
			String status= "";
			String ip = "null";

			Serial.println(request->hasParam("body", true));

		    if (request->hasParam("body", true)) {
				String body = request->getParam("body", true)->value();

				JsonDocument doc;
				DeserializationError error = deserializeJson(doc, body);

				if (error) {
					Serial.println("Failed to parse JSON");
					request->send(400, "text/plain", "Invalid JSON");
					return;
      			}

				const char* ssid = doc["ssid"];
				const char* password = doc["password"];
				unsigned long startTime = millis();

				WiFi.begin(ssid, password);

				
				Serial.println("Connecting\n");
				Serial.println(ssid);
				Serial.println(password);

				status = "success";

				while (WiFi.status() != WL_CONNECTED) {
					if (millis() - startTime >= WIFI_TIMEOUT) {
						Serial.println("\nConnection attempt timed out.");
						status = "failed";
						WiFi.disconnect(true);
						break;
                	}
					delay(1000);
					Serial.print(".");
					vTaskDelay(1 / portTICK_PERIOD_MS);
				}

				setWifiCredentials(ssid, password);

			} else {
				status = "failed";
			}
		
		AsyncResponseStream *response = request->beginResponseStream("application/json");
		response->print("{");
		response->print("\"status\":\"" + status + "\",");
		response->print("\"ip\":\""+ WiFi.localIP().toString() + "\"");
		response->print("}");
		request->send(response);
	});

	// the catch all
	server.onNotFound([localIPURL](AsyncWebServerRequest *request) {
		request->redirect(localIPURL);
		Serial.print("onnotfound ");
		Serial.print(request->host());	// This gives some insight into whatever was being requested on the serial monitor
		Serial.print(" ");
		Serial.print(request->url());
		Serial.print(" sent redirect to " + localIPURL + "\n");
	});

	server.begin();
}