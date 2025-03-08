import './style.css';
import { Button } from './components/button';
import { Card } from './components/card';
import { Prompt } from './components/prompt';
import { WifiList } from './components/wifList';
import { Input } from './components/input';
import { InputPassword } from './components/inputPassword';
import WifiIcon from './assets/wifi.svg';

if(customElements.get('m-button') === undefined) {
  customElements.define('m-button', Button);
}

if(customElements.get('m-card') === undefined) {
  customElements.define('m-card', Card);
}

if(customElements.get('m-prompt') === undefined) {
  customElements.define('m-prompt', Prompt);
}

if(customElements.get('m-wifi-list') === undefined) {
  customElements.define('m-wifi-list', WifiList);
}

if(customElements.get('m-input') === undefined) {
  customElements.define('m-input', Input);
}

if(customElements.get('m-input-password') === undefined) {
  customElements.define('m-input-password', InputPassword);
}

const nextButton = document.getElementById("next-button");
const connectButton = document.getElementById("connect-button");
const retryButton = document.getElementById("retry-button");
const prompt = document.getElementById("prompt");
const wifiCard = document.getElementById("wifi-card");
const wifiList = document.getElementById("wifi-list");
const wifiPasswordCard = document.getElementById("wifi-password-card");
const wifiPasswordInput = document.getElementById("wifi-password");
const loadingElement = document.getElementById("loading");
const connectionResultCard = document.getElementById("connection-result");

let AppState = 'Init';
let selectedNetwork = {
  ssid: '',
  encryption: false
};

let connectToWifi = async (ssid, password) => {
  let headerType = 'application/x-www-form-urlencoded';
  
  if(process.env.NODE_ENV === "development") {
    headerType = 'text/plain';
  }

  const response = (await fetch('wifi-connect', {
    method: 'POST',
    headers: {
      'Content-Type': headerType
    },
    body: JSON.stringify({
      ssid,
      password
    })
  })).json();
  return response;
}


wifiCard.onClose = () => {
  if(selectedNetwork.encryption) {
    AppState = 'Set-Password';
    wifiPasswordCard.show();
    // Clear previous network name
    document.querySelector('#wifi-password-card [slot="body"] .ssid').innerHTML = '';
    let p = document.createElement(`p`);
    p.innerText = `${selectedNetwork.ssid}'s Network`;
    document.querySelector('#wifi-password-card [slot="body"] .ssid').appendChild(p);
    connectButton.hidden = false;
  } else {
    AppState = 'Connecting-Network';
    connectToWifi(selectedNetwork.ssid, null);
  }
}

wifiPasswordCard.onClose = async () => {
  AppState = 'Connecting-Network';
  loadingElement.hidden =  false;
  
  let connectionRes = await connectToWifi(selectedNetwork.ssid, wifiPasswordInput.value);
  
  // Remove all existing slot elements first
  connectionResultCard.querySelectorAll('[slot]').forEach(element => {
    element.remove();
  });
  
  let connectionResultTitle = document.createElement('p');
  let bodyElement = document.createElement('div');
  
  bodyElement.setAttribute('slot', 'body');
  bodyElement.setAttribute('class', 'card-wrapper');
  bodyElement.setAttribute('style', 'padding: 0.75em;');

  bodyElement.innerHTML = /*html*/`
    <img src=${WifiIcon} style="width: 3em; height: 3em"/>
    <p>Your device is now connected to the network.<p>
    <p>You can now close this window.<p>
  `;

  connectionResultTitle.innerText = "Connected";
  connectionResultTitle.setAttribute('slot', 'title');

  AppState = 'Connected';

  if(connectionRes.status != "success") {
    connectionResultTitle.innerText = "Failed";
    bodyElement.innerHTML = /*html*/`
    <p>Your device was not able to connect to the network.<p>
    <p>Check the password and try again.<p>
    `;
    retryButton.hidden = false;
    // Clear password input after failed connection
    wifiPasswordInput.value = '';
  }

  connectionResultCard.appendChild(bodyElement);
  connectionResultCard.appendChild(connectionResultTitle);
  connectionResultCard.show();

  loadingElement.hidden =  true;
}

connectionResultCard.onClose = () => {
  AppState = 'List-Wifi';
  wifiCard.show();
  retryButton.hidden = true;
}

wifiList.onSelectWifi = (param)=> {
  selectedNetwork.ssid = param.ssid;
  selectedNetwork.encryption = (param.encryption === 'true');
  wifiCard.close();
}

prompt.onClear = () => {
  wifiCard.show();
  AppState = 'List-Wifi';
  nextButton.hidden = true;
}

nextButton.onclick = () => {
  if(AppState === 'Init') {
    prompt.clear();
  } else if(AppState === 'List-Wifi') {
    wifiCard.close();
  }
}

connectButton.onclick = async () => {
  wifiPasswordCard.close();
  connectButton.hidden = true;
}

retryButton.onclick =  async () => {
  AppState = 'List-Wifi';
  connectionResultCard.close();
  // Clear password input when retrying
  wifiPasswordInput.value = '';
}