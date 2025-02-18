#Read Me

This project was heavily copied from https://github.com/CDFER/Captive-Portal-ESP32?tab=readme-ov-file
The reason behind I created my own was to organize the code structure in folders for better reading.

Also, the HTML file generation is bit more sofisticated and the UI has a cleaner design.

##Updating HTML Static Files

As you can see there is a data folder in the root of the project. You can use it to update the static html files served. In order to do that, remember to send the updates to the esp32 device by tipping: 

```bash
    pio run --target uploadfs
```