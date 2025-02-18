export class Prompt extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.textPrompt = [];
        this.currentIndex = 0;
        this.hidden = false;
        this.onClearHandler = () => {};
        this.shadowRoot.innerHTML = /*html*/`
            <style>
                * {
                    box-sizing: border-box;
                }

                .prompt-text {
                    font-size: 1.6em;
                    font-weight: 400;
                    text-align: center;
                    opacity: 0;
                }

                .fadeIn {
                    animation-duration: 3s;
                    animation-timing-function: ease-in-out;
                    line-height: 1.2em;
                }

                .fadeOut {
                    animation: fadeOut 1s forwards;
                    animation-duration: 0.75s;
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    20%, 80% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
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
            <p class="prompt-text"></p> <!-- Único elemento de texto -->
        `;
        this.textElement = this.shadowRoot.querySelector('.prompt-text'); // Referência ao elemento de texto
    }

    static get observedAttributes() {
        return ['hidden'];
    }
    
    connectedCallback() {
        const textPromptAttr = this.getAttribute('textPrompt');

        if (textPromptAttr) {
            this.textPrompt = JSON.parse(textPromptAttr);
        }

        if (this.textPrompt.length > 0) {
            this.startAnimation();
        }
    }

    startAnimation() {
        const showNextText = () => {

            this.textElement.textContent = this.textPrompt[this.currentIndex];
            this.textElement.classList.add("fadeIn");
            this.textElement.style.animationName = 'none';
            void this.textElement.offsetWidth;
            this.textElement.style.animationName = 'fadeIn';        

            if (this.currentIndex === this.textPrompt.length - 1) {
                this.textElement.style.animationName = 'none';
                this.textElement.style.opacity = '1';
            } else {
                this.currentIndex = (this.currentIndex + 1) % this.textPrompt.length;

                setTimeout(showNextText, 3000); 
            }
        };

        showNextText();
    }

    set onClear(handler) {
        this.onClearHandler = handler;
    }

    clear = () => {
        this.textElement.style.animationName = 'fadeOut';
        void this.textElement.offsetWidth;
        this.textElement.classList.add("fadeOut");
        this.textElement.addEventListener("animationend", () => {
            this.textElement.remove();
            this.hidden = true;
            this.onClearHandler();
          }, { once: true });
    }
}