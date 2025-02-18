export class Card extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = /*html*/`
        <style>
            * {
                box-sizing: border-box;
            }

            .card {
                min-width: 242px;
                width: 100%;
                max-width: 480px;
                min-height: 296px;
                max-height: 296px;
                align-self: center;
                margin-left: auto;
                margin-right: auto;
                overflow: hidden;
                background-color: white;
                border-radius: 8px;
                border: 1px solid #e9e9e9;
                display: flex;
                flex-direction: column;
            }

            .card-title {
                position: sticky;
                width: 100%;
                display: flex;
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
                top: 0;
                height: 64px;
                padding: 4px;
                font-weight: 600;
                font-size: 1.2em;
                background-color: white;
                border-bottom: 1px solid #e9e9e9;
            }

            .card-body {
                overflow: scroll;
                width: 100%;
                flex-grow: 1;
                max-height: 232px;
            }


            .fadeOut {
                animation: fadeOut 0.75s forwards;
            }

            .fadeIn {
                animation: fadeIn 0.75s forwards;
            }


            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }

        </style>
        
        <div class="card">
            <slot name="title" class="card-title"></slot>
            <slot name="body" class="card-body"></slot>
        </div>
      `;
      this.content = this.shadowRoot.querySelector('.card');
      this.onCloseHandler = () => {}
      this.onShowHandler = () => {}
    }

    set onClose(handler) {
        this.onCloseHandler = handler;
    }

    set onShow(handler) {
        this.onShowHandler = handler;
    }

    show = () => {
        this.content.classList.remove("fadeOut");
        this.content.classList.add("fadeIn");
        this.content.style = "display: flex; opacity: 1;";
        this.hidden = false;
        this.content.addEventListener("animationend", () => {
            this.onShowHandler();
          }, { once: true });
    }

    close = () => {
        this.content.classList.remove("fadeIn");
        this.content.classList.add("fadeOut");
        this.content.style = "opacity: 0;"
        this.content.addEventListener("animationend", () => {
            this.onCloseHandler();
            this.content.style = "display: none;";
            this.hidden = true;
          }, { once: true });
    }

}