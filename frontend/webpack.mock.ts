import webpackMockServer from "webpack-mock-server";
import wifiList from "./dev/__stubs__/wifi-list.json";

interface ConnectResult {
  status: String,
  ip: String | null
}

export default webpackMockServer.add((app) => {
  app.get("/wifi-list", (_req, res) => {
    res.json(wifiList);
  });

  app.post("/wifi-connect", (_req, res) => {
    let bodyJson = (JSON.parse(_req.body));
    let resJson:ConnectResult = {
      status: "success",
      ip: "1.2.3.4",
    }
    switch(bodyJson.ssid) {
      case 'Wrong Password Wifi 5G':
        resJson.status = "failed",
        resJson.ip = null   
    }
    setTimeout(()=>{
      res.json(resJson);
    }, 2500)
  });

});