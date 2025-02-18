#include <setups/setUpDNSSServer.h>
#include <settings.h>

void setUpDNSServer(DNSServer &dnsServer, const IPAddress &localIP) {
	// Set the TTL for DNS response and start the DNS server
	dnsServer.setTTL(DNS_TTL);
	dnsServer.start(DNS_PORT, "*", localIP);
}