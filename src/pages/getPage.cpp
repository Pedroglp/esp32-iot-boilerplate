
#include <pages/getPage.h>
#include <cstring>
#include <Arduino.h>
#include <SPIFFS.h>

const char* getPage(char* path) {
  String pageBody = "";

  if (SPIFFS.begin(true)) {
    File file;

    if (strcmp(path, "index") == 0) {
      file = SPIFFS.open("/index.html", "r");
    }

    if (file) {
      while (file.available()) {
        pageBody += char(file.read());
      }
      file.close();
    }

    SPIFFS.end();
  } else {
    return "<!DOCTYPE html><html>Error loading html files</html>";
  }

  const String fullPage = pageBody;

  char* result = new char[fullPage.length() + 1];
  strcpy(result, fullPage.c_str());

  return result;
}