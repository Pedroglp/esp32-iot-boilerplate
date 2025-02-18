import WifiIcon from '../assets/wifi.svg';
import LockerClosedIcon from '../assets/lockerClosed.svg';
import LockerOpenedIcon from '../assets/lockerOpened.svg';

let WIFILIST = []

let getWifiList = async () => {
    const response = (await fetch('wifi-list', { method: 'GET' })).json();
    return response;
}

class WifiElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.wifiSelectedHandler = () => {};
        this.encryption = null;
        this.ssid = null;
        this.signal = null;
        this.shadowRoot.innerHTML = /*html*/`

            <style>
                * {
                    box-sizing: border-box;
                }

                .wifi-network {
                    display: flex;
                    width: 100%;
                    justify-content: space-between; 
                    padding: 8px 12px;
                    font-size: 0.8em;
                    background-color: white;
                    cursor: pointer;
                }

                .wifi-network:hover {
                    background-color: #e9e9e9;
                }

                .left {
                    display: flex;
                    margin: 0px;
                    align-items: center;
                    gap: 8px;
                }

                .right {
                    text-align: center;
                    margin-top: auto;
                    margin-bottom: auto;
                }
            </style>

            <div class="wifi-network">
                <div class="left">
                    <img src=${WifiIcon} alt="wifi-icon"/>                 
                    <p>${this.ssid}</p>
                </div>
                <div class="right">
                    ${this.encryption ?
                        `<img src=${LockerClosedIcon}  alt="locked/>` :
                        `<img src=${LockerOpenedIcon} alt="unlocked"/>`
                    }
                </div>
            </div>
        `
        this.wifiSsidElement = this.shadowRoot.querySelector('.left p');
        this.wifiEncryptionElement = this.shadowRoot.querySelector('.right');
        this.wifiNetworkElement = this.shadowRoot.querySelector('.wifi-network');

        this.wifiNetworkElement.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('wifiSelected', {
                detail: {
                    ssid: this.ssid,
                    encryption: this.encryption,
                    signal: this.signal
                },
                bubbles: true,
                composed: true
            }));
        });
    }

    static get observedAttributes() {
        return ['ssid', 'encryption', 'signal'];
    }

    attributeChangedCallback(name, before, after) {
        if(name === "ssid") {
            this.ssid = after;
            this.wifiSsidElement.textContent = after;
        }

        if(name === "encryption") {
            this.encryption = after;
            this.wifiEncryptionElement.innerHTML = after.toLowerCase() === 'true' ? `<img src=${LockerClosedIcon} alt="locked"/>` : `<img src=${LockerOpenedIcon} alt="unlocked"/>`
        }

        if(name === "signal") {
            this.signal = after;
        }
    }

}

if(customElements.get('m-wifi-element') === undefined) {
    customElements.define('m-wifi-element', WifiElement);
}


export class WifiList extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.wifiSelectHandler = () => {};
      this.shadowRoot.innerHTML = /*html*/`
        <style>
            * {
                box-sizing: border-box;
            }

            .wifi-list {
                display: flex;
                flex-direction: column;
                justify-items: start;
                width: 100%;
                flex-wrap: wrap;
                overflow: scroll;
            }

        </style>
        
        <div class="wifi-list">
        </div>
      `;
      this.content = this.shadowRoot.querySelector(".wifi-list");
      this.wifiNetworkElement = this.shadowRoot.querySelector('.wifi-network');
    }
    
    async connectedCallback () {
        getWifiList().then(data => {
            data.forEach(wifi => {
                const wifiElement = document.createElement('m-wifi-element');
                wifiElement.setAttribute('ssid', wifi.ssid);
                wifiElement.setAttribute('encryption', wifi.encryption);
                wifiElement.setAttribute('signal', wifi.signal);
                this.content.appendChild(wifiElement);
                wifiElement.addEventListener('wifiSelected', (event) => {
                    this.wifiSelectHandler(event.detail);
                });
            });
        });
    }

    set onSelectWifi(handler) {
        this.wifiSelectHandler = handler;
    }

}