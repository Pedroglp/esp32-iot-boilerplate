import eyeOpen from '../assets/eyeOpen.svg';
import eyeClosed from '../assets/eyeClosed.svg';

export class InputPassword extends HTMLElement {
    constructor() {
        super();
        this.type = "password";
        this.placeholder = "Password"
        this.value = "",
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = /*html*/`
            <m-input type="password" placeholder="Password"></m-input>
        `
    }

    connectedCallback() {
        let eyeImg = document.createElement('img');
        eyeImg.src = eyeClosed;
        eyeImg.setAttribute('slot', 'right');
        eyeImg.id = "eye-icon";

        eyeImg.addEventListener('click', ()=>{
            this.togglePassword();
        });

        let input = this.shadowRoot.querySelector('m-input');

        input.appendChild(eyeImg);
        input.addEventListener('input', (event) => {
            this.value = input.value;
            document.dispatchEvent(new Event(event.type, event));
        })
    }


    attributeChangedCallback(name, before, after) {

        if(name === "placholder" && this.input) {
            this.shadowRoot.querySelector('m-input').placeholder = after || "";
        }
    }

    static get observedAttributes() {
        return ['placeholder'];
    }

    togglePassword() {
        if(this.type === "password") {
            this.type = "text";
            this.shadowRoot.getElementById('eye-icon').src = eyeOpen;
        } else {
            this.type = "password";
            this.shadowRoot.getElementById('eye-icon').src = eyeClosed;
        }
        this.shadowRoot.querySelector('m-input').setAttribute ("type", this.type);
    }
}