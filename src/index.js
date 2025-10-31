/**
 * Sistema de Máscaras Vanilla JavaScript
 * Substitui jQuery Mask Plugin com performance superior e zero dependências
 */

// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================

/**
 * Padrões de regex para remoção de caracteres não numéricos
 * @type {RegExp}
 */
const NON_DIGITS_REGEX = /\D/g;

/**
 * Configurações de maxlength para cada tipo de máscara
 * @type {Object.<string, number>}
 */
const MASK_MAX_LENGTHS = {
   cpf: 14,
   cnpj: 18,
   cep: 9,
   phone: 15,
   date: 10,
};

/**
 * Padrões de formatação para máscaras
 * @type {Object.<string, Array.<{length: number, pattern: RegExp, replacement: string}>>}
 */
const MASK_PATTERNS = {
   cnpj: [
      { length: 2, pattern: /(\d{2})/, replacement: "$1" },
      { length: 5, pattern: /(\d{2})(\d{3})/, replacement: "$1.$2" },
      { length: 8, pattern: /(\d{2})(\d{3})(\d{3})/, replacement: "$1.$2.$3" },
      {
         length: 12,
         pattern: /(\d{2})(\d{3})(\d{3})(\d{4})/,
         replacement: "$1.$2.$3/$4",
      },
      {
         length: 14,
         pattern: /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
         replacement: "$1.$2.$3/$4-$5",
      },
   ],
   cpf: [
      { length: 3, pattern: /(\d{3})/, replacement: "$1" },
      { length: 6, pattern: /(\d{3})(\d{3})/, replacement: "$1.$2" },
      { length: 9, pattern: /(\d{3})(\d{3})(\d{3})/, replacement: "$1.$2.$3" },
      {
         length: 11,
         pattern: /(\d{3})(\d{3})(\d{3})(\d{2})/,
         replacement: "$1.$2.$3-$4",
      },
   ],
   cep: [
      { length: 5, pattern: /(\d{5})/, replacement: "$1" },
      { length: 8, pattern: /(\d{5})(\d{3})/, replacement: "$1-$2" },
   ],
   phone: [
      { length: 2, pattern: /(\d{2})/, replacement: "($1" },
      { length: 6, pattern: /(\d{2})(\d{4})/, replacement: "($1) $2" },
      {
         length: 10,
         pattern: /(\d{2})(\d{4})(\d{4})/,
         replacement: "($1) $2-$3",
      },
      {
         length: 11,
         pattern: /(\d{2})(\d{5})(\d{4})/,
         replacement: "($1) $2-$3",
      },
   ],
   date: [
      { length: 2, pattern: /(\d{2})/, replacement: "$1" },
      { length: 4, pattern: /(\d{2})(\d{2})/, replacement: "$1/$2" },
      { length: 8, pattern: /(\d{2})(\d{2})(\d{4})/, replacement: "$1/$2/$3" },
   ],
};

/**
 * Tipos que requerem apenas números
 * @type {string[]}
 */
const NUMERIC_ONLY_TYPES = ["cpf", "cnpj", "cep", "phone"];

/**
 * Configurações padrão para debounce
 * @type {Object}
 */
const DEBOUNCE_DEFAULTS = {
   delay: 300, // ms
   leading: false,
   trailing: true,
};

/**
 * Configurações de internacionalização
 * @type {Object.<string, Object.<string, string>>}
 */
const I18N_MESSAGES = {
   pt: {
      invalidFormat: "Formato inválido",
      required: "Campo obrigatório",
      invalidCPF: "CPF inválido",
      invalidCNPJ: "CNPJ inválido",
   },
   en: {
      invalidFormat: "Invalid format",
      required: "Required field",
      invalidCPF: "Invalid CPF",
      invalidCNPJ: "Invalid CNPJ",
   },
   es: {
      invalidFormat: "Formato inválido",
      required: "Campo obligatorio",
      invalidCPF: "CPF inválido",
      invalidCNPJ: "CNPJ inválido",
   },
};

/**
 * Idioma padrão do sistema
 * @type {string}
 */
const DEFAULT_LOCALE = "pt";

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Remove caracteres não numéricos de uma string
 * @param {string} value - Valor a ser processado
 * @returns {string} String contendo apenas dígitos
 * @example
 * removeNonDigits("123-456.789") // "123456789"
 */
function removeNonDigits(value) {
   return value.replace(NON_DIGITS_REGEX, "");
}

/**
 * Aplica formatação baseada em padrões configurados
 * @param {string} value - Valor a ser formatado
 * @param {string} type - Tipo da máscara (cpf, cnpj, cep, phone, date)
 * @param {number} maxLength - Comprimento máximo permitido
 * @returns {string} Valor formatado
 */
function applyMaskPattern(value, type, maxLength) {
   const digits = removeNonDigits(value).substring(0, maxLength);
   const patterns = MASK_PATTERNS[type];

   if (!patterns) return digits;

   // Encontra o padrão apropriado baseado no comprimento
   const pattern = patterns
      .slice()
      .reverse()
      .find((p) => digits.length >= p.length);

   return pattern
      ? digits.replace(pattern.pattern, pattern.replacement)
      : digits;
}

/**
 * Cria função debounce para otimizar performance
 * @param {Function} func - Função a ser debounced
 * @param {number} delay - Delay em milissegundos
 * @param {Object} options - Opções de configuração
 * @returns {Function} Função debounced
 */
function debounce(func, delay = DEBOUNCE_DEFAULTS.delay, options = {}) {
   const {
      leading = DEBOUNCE_DEFAULTS.leading,
      trailing = DEBOUNCE_DEFAULTS.trailing,
   } = options;

   let timeoutId;
   let lastExecTime = 0;
   let lastResult;

   return function (...args) {
      const currentTime = Date.now();

      if (leading && currentTime - lastExecTime >= delay) {
         lastExecTime = currentTime;
         lastResult = func.apply(this, args);
         return lastResult;
      }

      clearTimeout(timeoutId);

      if (trailing) {
         timeoutId = setTimeout(() => {
            lastExecTime = Date.now();
            lastResult = func.apply(this, args);
         }, delay);
      }

      return lastResult;
   };
}

/**
 * Aplica máscara customizada usando regex externa
 * @param {string} value - Valor a ser formatado
 * @param {RegExp} pattern - Padrão regex para formatação
 * @param {string} replacement - String de substituição
 * @param {number} maxLength - Comprimento máximo permitido
 * @returns {string} Valor formatado
 * @example
 * applyCustomMask("123456789", /(\d{3})(\d{3})(\d{3})/, "$1.$2.$3") // "123.456.789"
 */
function applyCustomMask(value, pattern, replacement, maxLength = Infinity) {
   const digits = removeNonDigits(value).substring(0, maxLength);
   return digits.replace(pattern, replacement);
}

/**
 * Obtém mensagem internacionalizada
 * @param {string} key - Chave da mensagem
 * @param {string} locale - Idioma (pt, en, es)
 * @returns {string} Mensagem traduzida
 */
function getLocalizedMessage(key, locale = DEFAULT_LOCALE) {
   return (
      I18N_MESSAGES[locale]?.[key] || I18N_MESSAGES[DEFAULT_LOCALE][key] || key
   );
}

/**
 * Detecta idioma do navegador ou sistema
 * @returns {string} Código do idioma detectado
 */
function detectLocale() {
   if (typeof navigator !== "undefined") {
      const lang = navigator.language || navigator.userLanguage;
      const shortLang = lang.split("-")[0];
      return I18N_MESSAGES[shortLang] ? shortLang : DEFAULT_LOCALE;
   }
   return DEFAULT_LOCALE;
}

// ========================================
// FUNÇÕES DE FORMATAÇÃO
// ========================================

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 * @param {string} value - Valor a ser formatado
 * @returns {string} CNPJ formatado
 * @example
 * formatCNPJ("12345678000195") // "12.345.678/0001-95"
 */
function formatCNPJ(value) {
   return applyMaskPattern(value, "cnpj", 14);
}

/**
 * Aplica máscara de CPF: 000.000.000-00
 * @param {string} value - Valor a ser formatado
 * @returns {string} CPF formatado
 * @example
 * formatCPF("12345678901") // "123.456.789-01"
 */
function formatCPF(value) {
   return applyMaskPattern(value, "cpf", 11);
}

/**
 * Aplica máscara de CEP: 00000-000
 * @param {string} value - Valor a ser formatado
 * @returns {string} CEP formatado
 * @example
 * formatCEP("12345678") // "12345-678"
 */
function formatCEP(value) {
   return applyMaskPattern(value, "cep", 8);
}

/**
 * Aplica máscara de telefone: (00) 00000-0000
 * @param {string} value - Valor a ser formatado
 * @returns {string} Telefone formatado
 * @example
 * formatPhone("11987654321") // "(11) 98765-4321"
 */
function formatPhone(value) {
   return applyMaskPattern(value, "phone", 11);
}

/**
 * Aplica máscara de data: 00/00/0000
 * @param {string} value - Valor a ser formatado
 * @returns {string} Data formatada
 * @example
 * formatDate("31122025") // "31/12/2025"
 */
function formatDate(value) {
   return applyMaskPattern(value, "date", 8);
}

// ========================================
// VALIDADORES
// ========================================

/**
 * Calcula dígito verificador usando algoritmo padrão brasileiro
 * @param {string} digits - Dígitos para cálculo
 * @param {number[]} weights - Pesos para multiplicação
 * @returns {number} Dígito verificador calculado
 */
function calculateCheckDigit(digits, weights) {
   let sum = 0;
   for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits.charAt(i)) * weights[i];
   }

   const remainder = sum % 11;
   return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Verifica se todos os dígitos são iguais (caso inválido)
 * @param {string} digits - Dígitos a verificar
 * @returns {boolean} True se todos os dígitos são iguais
 */
function hasAllEqualDigits(digits) {
   return /^(\d)\1+$/.test(digits);
}

/**
 * Valida CPF usando algoritmo oficial da Receita Federal
 * @param {string} value - CPF a ser validado (com ou sem máscara)
 * @returns {boolean} True se CPF é válido
 * @example
 * validateCPF("123.456.789-01") // false
 * validateCPF("529.982.247-25") // true
 */
function validateCPF(value) {
   const digits = removeNonDigits(value);

   if (digits.length !== 11 || hasAllEqualDigits(digits)) {
      return false;
   }

   // Primeiro dígito verificador
   const firstWeights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
   const firstCheckDigit = calculateCheckDigit(
      digits.substring(0, 9),
      firstWeights
   );

   if (firstCheckDigit !== parseInt(digits.charAt(9))) {
      return false;
   }

   // Segundo dígito verificador
   const secondWeights = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
   const secondCheckDigit = calculateCheckDigit(
      digits.substring(0, 10),
      secondWeights
   );

   return secondCheckDigit === parseInt(digits.charAt(10));
}

/**
 * Valida CNPJ usando algoritmo oficial da Receita Federal
 * @param {string} value - CNPJ a ser validado (com ou sem máscara)
 * @returns {boolean} True se CNPJ é válido
 * @example
 * validateCNPJ("12.345.678/0001-95") // false
 * validateCNPJ("11.958.235/0001-40") // true
 */
function validateCNPJ(value) {
   const digits = removeNonDigits(value);

   if (digits.length !== 14 || hasAllEqualDigits(digits)) {
      return false;
   }

   // Primeiro dígito verificador
   const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
   const firstCheckDigit = calculateCheckDigit(
      digits.substring(0, 12),
      firstWeights
   );

   if (firstCheckDigit !== parseInt(digits.charAt(12))) {
      return false;
   }

   // Segundo dígito verificador
   const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
   const secondCheckDigit = calculateCheckDigit(
      digits.substring(0, 13),
      secondWeights
   );

   return secondCheckDigit === parseInt(digits.charAt(13));
}

// ========================================
// CLASSE PRINCIPAL
// ========================================

/**
 * Classe principal para aplicação de máscaras em campos de input
 * @class VanillaMask
 * @example
 * // CPF com validação
 * new VanillaMask('cpf', 'cpf', { validator: validateCPF });
 *
 * // CEP simples
 * new VanillaMask('cep', 'cep');
 */
class VanillaMask {
   /**
    * @param {string} elementId - ID do elemento input
    * @param {string} type - Tipo da máscara (cpf, cnpj, cep, phone, date)
    * @param {Object} options - Opções de configuração
    * @param {boolean} options.clearIfNotMatch - Limpar campo se inválido no blur
    * @param {string} options.placeholder - Placeholder do campo
    * @param {Function} options.validator - Função de validação customizada
    * @param {string} options.errorMessage - Mensagem de erro customizada
    * @param {string} options.locale - Idioma para mensagens (pt, en, es)
    */
   constructor(elementId, type, options = {}) {
      this.element = document.getElementById(elementId);
      this.type = type;
      this.options = {
         clearIfNotMatch: true,
         placeholder: "",
         validator: null,
         errorMessage: null,
         locale: detectLocale(),
         ...options,
      };

      if (!this.element) {
         console.warn(`Elemento com ID '${elementId}' não encontrado`);
         return;
      }

      this.#init();
   }

   /**
    * Inicializa a máscara no elemento
    * @private
    */
   #init() {
      this.#applyMaxLength();
      this.#addEventListeners();
   }

   /**
    * Aplica maxlength baseado no tipo da máscara
    * @private
    */
   #applyMaxLength() {
      const maxLength = MASK_MAX_LENGTHS[this.type];
      if (maxLength) {
         this.element.setAttribute("maxlength", maxLength);
      }
   }

   /**
    * Adiciona event listeners necessários
    * @private
    */
   #addEventListeners() {
      this.element.addEventListener("input", this.#handleInput.bind(this));
      this.element.addEventListener(
         "keypress",
         this.#handleKeyPress.bind(this)
      );
      this.element.addEventListener("blur", this.#handleBlur.bind(this));
   }

   /**
    * Trata evento de input aplicando máscara
    * @private
    * @param {Event} event - Evento de input
    */
   #handleInput(event) {
      const input = event.target;

      // Usa debounce para otimizar performance em entradas rápidas
      const debouncedFormat = debounce(() => {
         const formattedValue = this.#format(input.value);
         input.value = formattedValue;

         if (this.options.validator) {
            this.#validateField(formattedValue);
         }
      }, 100); // Delay reduzido para resposta mais rápida

      debouncedFormat();
   }

   /**
    * Trata evento de keypress para validação de entrada
    * @private
    * @param {KeyboardEvent} event - Evento de keypress
    */
   #handleKeyPress(event) {
      const allowedKeys = [
         "Backspace",
         "Delete",
         "Tab",
         "Escape",
         "Enter",
         "ArrowLeft",
         "ArrowRight",
         "ArrowUp",
         "ArrowDown",
         "Home",
         "End",
      ];

      if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
         return;
      }

      if (this.#requiresNumbers() && !/[0-9]/.test(event.key)) {
         event.preventDefault();
      }
   }

   /**
    * Trata evento de blur para validação final
    * @private
    * @param {Event} event - Evento de blur
    */
   #handleBlur(event) {
      if (this.options.clearIfNotMatch && this.options.validator) {
         const value = event.target.value;
         if (value && !this.options.validator(value)) {
            event.target.value = "";
            const errorMessage = this.#getErrorMessage();
            this.#showError(errorMessage);
         } else {
            this.#clearError();
         }
      }
   }

   /**
    * Obtém mensagem de erro apropriada
    * @private
    * @returns {string} Mensagem de erro
    */
   #getErrorMessage() {
      if (this.options.errorMessage) {
         return this.options.errorMessage;
      }

      // Mensagens específicas por tipo
      const typeMessages = {
         cpf: "invalidCPF",
         cnpj: "invalidCNPJ",
      };

      const messageKey = typeMessages[this.type] || "invalidFormat";
      return getLocalizedMessage(messageKey, this.options.locale);
   }

   /**
    * Verifica se o tipo requer apenas números
    * @private
    * @returns {boolean} True se requer apenas números
    */
   #requiresNumbers() {
      return NUMERIC_ONLY_TYPES.includes(this.type);
   }

   /**
    * Aplica formatação baseada no tipo
    * @private
    * @param {string} value - Valor a ser formatado
    * @returns {string} Valor formatado
    */
   #format(value) {
      switch (this.type) {
         case "cnpj":
            return formatCNPJ(value);
         case "cpf":
            return formatCPF(value);
         case "cep":
            return formatCEP(value);
         case "phone":
            return formatPhone(value);
         case "date":
            return formatDate(value);
         default:
            return value;
      }
   }

   /**
    * Valida campo e atualiza classes CSS e acessibilidade
    * @private
    * @param {string} value - Valor a ser validado
    */
   #validateField(value) {
      const isValid = this.options.validator(value);

      this.element.classList.toggle("is-invalid", !isValid && value.length > 0);

      // Atualiza atributos de acessibilidade
      if (!isValid && value.length > 0) {
         this.element.setAttribute("aria-invalid", "true");
         const errorId = `error-${this.element.id}`;
         this.element.setAttribute("aria-describedby", errorId);
      } else {
         this.element.removeAttribute("aria-invalid");
         this.element.removeAttribute("aria-describedby");
      }

      if (isValid) {
         this.#clearError();
      }
   }

   /**
    * Exibe mensagem de erro com acessibilidade
    * @private
    * @param {string} message - Mensagem de erro
    */
   #showError(message) {
      this.#clearError();
      const errorDiv = document.createElement("div");
      errorDiv.className = "invalid-feedback";
      errorDiv.textContent = message;
      errorDiv.id = `error-${this.element.id}`;
      errorDiv.setAttribute("role", "alert");
      errorDiv.setAttribute("aria-live", "polite");
      this.element.parentNode.insertBefore(errorDiv, this.element.nextSibling);
   }

   /**
    * Remove mensagem de erro existente
    * @private
    */
   #clearError() {
      const existingError =
         this.element.parentNode.querySelector(".invalid-feedback");
      if (existingError) {
         existingError.remove();
      }
   }
}

// ========================================
// CONFIGURAÇÃO DE INICIALIZAÇÃO
// ========================================

/**
 * Configuração padrão para inicialização automática de máscaras
 * @type {Array.<{id: string, type: string, validator?: Function}>}
 */
const DEFAULT_MASK_CONFIG = [
   { id: "cnpj", type: "cnpj", validator: validateCNPJ },
   { id: "cpf", type: "cpf", validator: validateCPF },
   { id: "cep", type: "cep" },
   { id: "phone_personal", type: "phone" },
   { id: "phone_business", type: "phone" },
   { id: "birth_date", type: "date" },
];

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Inicializa máscaras baseado em configuração
 * @param {Array.<{id: string, type: string, validator?: Function}>} config - Configuração das máscaras
 * @example
 * initializeMasksFromConfig([
 *    { id: 'cpf', type: 'cpf', validator: validateCPF },
 *    { id: 'cep', type: 'cep' }
 * ]);
 */
function initializeMasksFromConfig(config) {
   config.forEach(({ id, type, validator }) => {
      const element = document.getElementById(id);
      if (element) {
         new VanillaMask(id, type, validator ? { validator } : {});
      }
   });
}

/**
 * Inicializa todas as máscaras de uma página usando configuração padrão
 * @example
 * initializeMasks(); // Inicializa todas as máscaras padrão
 */
function initializeMasks() {
   initializeMasksFromConfig(DEFAULT_MASK_CONFIG);
}

// ========================================
// EXPORTS (ES6 Modules)
// ========================================

/**
 * Exportações para uso como módulo ES6
 * @example
 * import { VanillaMask, validateCPF, formatCPF } from './vanilla-masks.js';
 *
 * // Ou importação completa
 * import * as Masks from './vanilla-masks.js';
 */
export {
   DEFAULT_MASK_CONFIG,
   formatCEP,
   formatCNPJ,
   formatCPF,
   formatDate,
   formatPhone,
   initializeMasks,
   initializeMasksFromConfig,
   removeNonDigits,
   validateCNPJ,
   validateCPF,
   VanillaMask,
};

// ========================================
// COMPATIBILIDADE LEGACY
// ========================================

/**
 * Compatibilidade com CommonJS (Node.js) e carregamento global
 */
if (typeof module !== "undefined" && module.exports) {
   // CommonJS
   module.exports = {
      VanillaMask,
      initializeMasks,
      initializeMasksFromConfig,
      validateCPF,
      validateCNPJ,
      formatCNPJ,
      formatCPF,
      formatCEP,
      formatPhone,
      formatDate,
      removeNonDigits,
      applyCustomMask,
      debounce,
      getLocalizedMessage,
      detectLocale,
      DEFAULT_MASK_CONFIG,
      MASK_PATTERNS,
      MASK_MAX_LENGTHS,
      I18N_MESSAGES,
      DEFAULT_LOCALE,
   };
} else if (typeof window !== "undefined") {
   // Global (browser)
   window.VanillaMask = VanillaMask;
   window.initializeMasks = initializeMasks;
   window.initializeMasksFromConfig = initializeMasksFromConfig;
   window.validateCPF = validateCPF;
   window.validateCNPJ = validateCNPJ;
   window.formatCPF = formatCPF;
   window.formatCNPJ = formatCNPJ;
   window.formatCEP = formatCEP;
   window.formatPhone = formatPhone;
   window.formatDate = formatDate;
   window.removeNonDigits = removeNonDigits;
}

// ========================================
// AUTO-INICIALIZAÇÃO
// ========================================

/**
 * Inicialização automática quando DOM estiver pronto
 * Só executa se não estiver sendo usado como módulo
 */
if (typeof window !== "undefined" && document.readyState === "loading") {
   document.addEventListener("DOMContentLoaded", initializeMasks);
} else if (typeof window !== "undefined" && document.readyState !== "loading") {
   // DOM já carregado
   initializeMasks();
}
