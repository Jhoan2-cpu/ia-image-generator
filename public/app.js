class ImageGenerator {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.generationsLeft = 10;
        this.imageHistory = [];
        this.maxHistory = 3;

        this.initializeElements();
        this.attachEventListeners();
        this.loadSessionInfo();
    }

    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.charCount = document.getElementById('charCount');
        this.generateBtn = document.getElementById('generateBtn');
        this.btnText = this.generateBtn.querySelector('.btn-text');
        this.btnLoader = this.generateBtn.querySelector('.btn-loader');
        this.generatedImage = document.getElementById('generatedImage');
        this.resultSection = document.getElementById('resultSection');
        this.historySection = document.getElementById('historySection');
        this.historyGrid = document.getElementById('historyGrid');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.generationsLeftEl = document.getElementById('generationsLeft');
        this.promptButtons = document.querySelectorAll('.prompt-btn');
    }

    attachEventListeners() {
        // Contador de caracteres
        this.promptInput.addEventListener('input', () => {
            this.updateCharCount();
        });

        // Generar imagen
        this.generateBtn.addEventListener('click', () => {
            this.generateImage();
        });

        // Prompts sugeridos
        this.promptButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.promptInput.value = prompt;
                this.updateCharCount();
            });
        });

        // Descargar imagen
        this.downloadBtn.addEventListener('click', () => {
            this.downloadImage(this.generatedImage.src);
        });

        // Enter para generar (Ctrl+Enter)
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateImage();
            }
        });
    }

    generateSessionId() {
        // Generar UUID simple
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateCharCount() {
        const count = this.promptInput.value.length;
        this.charCount.textContent = count;

        if (count < 10) {
            this.charCount.style.color = 'var(--error-color)';
        } else if (count > 450) {
            this.charCount.style.color = 'var(--error-color)';
        } else {
            this.charCount.style.color = 'var(--text-secondary)';
        }
    }

    async loadSessionInfo() {
        try {
            const response = await fetch(`/api/session-info/${this.sessionId}`);
            const data = await response.json();

            this.generationsLeft = data.generationsLeft;
            this.updateGenerationsCounter();
        } catch (error) {
            console.error('Error al cargar info de sesión:', error);
        }
    }

    updateGenerationsCounter() {
        const used = 10 - this.generationsLeft;
        this.generationsLeftEl.textContent = `${this.generationsLeft}/10`;

        if (this.generationsLeft === 0) {
            this.generationsLeftEl.style.color = 'var(--error-color)';
            this.generateBtn.disabled = true;
        } else if (this.generationsLeft <= 3) {
            this.generationsLeftEl.style.color = 'var(--error-color)';
        } else {
            this.generationsLeftEl.style.color = 'var(--primary-color)';
        }
    }

    validatePrompt() {
        const prompt = this.promptInput.value.trim();

        if (!prompt) {
            this.showError('Por favor, escribe una descripción para la imagen');
            return false;
        }

        if (prompt.length < 10) {
            this.showError('La descripción debe tener al menos 10 caracteres');
            return false;
        }

        if (prompt.length > 500) {
            this.showError('La descripción no debe exceder 500 caracteres');
            return false;
        }

        if (this.generationsLeft <= 0) {
            this.showError('Has alcanzado el límite máximo de generaciones');
            return false;
        }

        return true;
    }

    async generateImage() {
        if (!this.validatePrompt()) {
            return;
        }

        const prompt = this.promptInput.value.trim();

        // Mostrar loading
        this.setLoading(true);
        this.hideError();

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error al generar la imagen');
            }

            // Mostrar imagen
            this.displayImage(data.imageUrl, prompt);

            // Actualizar contador
            this.generationsLeft = data.generationsLeft;
            this.updateGenerationsCounter();

            // Agregar al historial
            this.addToHistory(data.imageUrl, prompt);

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    displayImage(imageUrl, prompt) {
        this.generatedImage.src = imageUrl;
        this.generatedImage.alt = prompt;
        this.resultSection.style.display = 'block';

        // Scroll suave a la imagen
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    addToHistory(imageUrl, prompt) {
        // Agregar al inicio del array
        this.imageHistory.unshift({ url: imageUrl, prompt: prompt });

        // Mantener solo las últimas 3
        if (this.imageHistory.length > this.maxHistory) {
            this.imageHistory.pop();
        }

        this.renderHistory();
    }

    renderHistory() {
        if (this.imageHistory.length === 0) {
            this.historySection.style.display = 'none';
            return;
        }

        this.historySection.style.display = 'block';
        this.historyGrid.innerHTML = '';

        this.imageHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `<img src="${item.url}" alt="${item.prompt}">`;

            historyItem.addEventListener('click', () => {
                this.displayImage(item.url, item.prompt);
            });

            this.historyGrid.appendChild(historyItem);
        });
    }

    downloadImage(imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `imagen-ia-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.btnLoader.style.display = 'flex';
        } else {
            this.generateBtn.disabled = false;
            this.btnText.style.display = 'inline';
            this.btnLoader.style.display = 'none';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ImageGenerator();
});
