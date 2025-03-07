export class Input extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = /*html*/`
        <style>
            * {
                box-sizing: border-box;
            }

            input {
                background-color: white;
                font-weight: 400;
                border: 1px solid #e9e9e9;
                padding: 1em 1em 1em 1em;
                border-radius: 1.5em;
                width: 100%;
            }

            input:focus, input:active, input:focus-visibile{
                border: none;  
                outline: none;
            }

            .input-wrapper {
                display: block;
                cursor: pointer;
                width: 15em;
            }

            .right {
                position: relative;
                top: -1.875em;
                float: right;
                right: 0.75em;
                height: 1.5em;
                width: 1.5em;
                z-index: 2;
            }

            .left {
                position: relative;
                left: 0.75em;
                bottom: -2.375em;
                height: 1.5em;
                width: 1.5em;
                z-index: 2;
            }

        </style>
        <div id="content">
            <div class="input-wrapper">
                <div  class="left">
                    <slot name="left"></slot>
                </div>
                <input type="password" placeholder="Password"/>
                <div class="right">
                    <slot name="right"></slot>
                </div>
            </div>
        </div>
      `;
      this.input = this.shadowRoot.querySelector('input');
      this.leftSlot = this.shadowRoot.querySelector('slot[name="left"]');
      this.rightSlot = this.shadowRoot.querySelector('slot[name="right"]');
    }

    static get observedAttributes() {
        return ['type', 'placeholder', 'value'];
    }

    leftSlotChange() {
        if(typeof this.leftSlot !== "undefined") {
            const hasLeftIcon = this.leftSlot?.assignedNodes().length > 0;

            if (hasLeftIcon) {
                this.input.style.paddingLeft = '2.5em';
            } else {
                this.input.style.paddingLeft = '1em';
            }
        }
    }

    rightSlotChange() {
        if(typeof this.rightSlot !== "undefined") {
            const hasRightIcon = this.rightSlot?.assignedNodes().length > 0;
    
            if (hasRightIcon) {
                this.input.style.paddingRight = '2.5em';
            } else {
                this.input.style.paddingRight = '1em';
            }
        }
    }

    connectedCallback() {   
        this.leftSlot.addEventListener("slotchange", this.leftSlotChange.bind(this));
        this.rightSlot.addEventListener("slotchange", this.rightSlotChange.bind(this));
        this.input.addEventListener('input', (event) => {
            this.value = this.input.value;
            document.dispatchEvent(new Event(event.type, event));
          });
    }

    attributeChangedCallback(name, before, after) {

        if(name === "type" && this.input) {
            this.input.type = after || "";
        }

        if(name === "placholder" && this.input) {
            this.input.placeholder = after || "";
        }

        if(name === "value" && this.input) {
            this.input.value = after || "";
        }

    }

    get type() {
        return this.getAttribute('type');
    }

    set type(value) {
        this.setAttribute('type', value);
    }

    get placeholder() {
        return this.getAttribute('placeholder');
    }

    set placeholder(value) {
        this.setAttribute('placeholder', value);
    }

    set onClick(handler) {
        this.input.onclick = handler;
    }
}