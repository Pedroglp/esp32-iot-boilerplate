export class Button extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = /*html*/`
        <style>
            * {
                box-sizing: border-box;
            }

            button {
                padding: 0.9em;
                border: 1px solid #e9e9e9;
                background-color: white;
                border-radius: 24px;
                min-width: 108px;
                font-weight: 400;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
            }

            button:hover {
                filter: brightness(95%);
            }

        </style>
        <button><slot></slot></button>
      `;
      this.button = this.shadowRoot.querySelector('button');
    }

    set onClick(handler) {
        this.button.onclick = handler;
    }
}