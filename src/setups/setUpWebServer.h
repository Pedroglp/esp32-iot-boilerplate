#ifndef SETUPWEBSERVER_H
#define SETUPWEBSERVER_H
#include <ESPAsyncWebServer.h>	//https://github.com/me-no-dev/ESPAsyncWebServer using the latest dev version from @me-no-dev

void setUpWebServer(AsyncWebServer &server, const IPAddress &localIP);

#endif