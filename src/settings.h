#define MAX_CLIENTS     4   // ESP32 supports up to 10 but I have not tested it yet
#define WIFI_CHANNEL    6	// 2.4ghz channel 6 https://en.wikipedia.org/wiki/List_of_WLAN_channels#2.4_GHz_(802.11b/g/n/ax)
#define DNS_INTERVAL    30
#define WIFI_SSID       "WIFI_NAME" // FYI The SSID can't have a space in it.
#define WIFI_PASSWORD   NULL // at least 8 characters, NULL = no passwords
#define IP_PART_1       4
#define IP_PART_2       3
#define IP_PART_3       2
#define IP_PART_4       1
#define LOCAL_IP        {IP_PART_1, IP_PART_2, IP_PART_3, IP_PART_4} // 4.3.2.1
#define GATEWAY_IP      {IP_PART_1, IP_PART_2, IP_PART_3, IP_PART_4} // 4.3.2.1
#define SUBNET_MASK     {255, 255, 255, 0} // 255.255.255.0
#define WEB_SERVER_PORT 80
#define DNS_TTL         3600
#define DNS_PORT        53 
#define WIFI_TIMEOUT    10000