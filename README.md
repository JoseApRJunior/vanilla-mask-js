# Vanilla Mask JS

Sistema de máscaras para inputs em JavaScript puro, com validação, internacionalização e acessibilidade. Substitui jQuery Mask Plugin com performance superior e zero dependências.

## ✨ Características

-  🚀 **Performance Superior**: JavaScript puro sem dependências externas
-  ✅ **Validação Oficial**: Algoritmos da Receita Federal para CPF/CNPJ
-  🌍 **Internacionalização**: Suporte para português, inglês e espanhol
-  ♿ **Acessibilidade**: Compatível com leitores de tela (ARIA)
-  📱 **Responsivo**: Funciona em desktop e mobile
-  🔧 **Flexível**: Fácil customização e extensão

## 📦 Instalação

```bash
npm install vanilla-mask-js
```

Ou copie o arquivo `src/index.js` para seu projeto.

## 🚀 Uso Básico

### ES Modules (Recomendado)

```js
import { VanillaMask, validateCPF } from "vanilla-mask-js";

// CPF com validação
new VanillaMask("cpf-input", "cpf", {
   validator: validateCPF,
   locale: "pt",
});

// CEP simples
new VanillaMask("cep-input", "cep");
```

### CommonJS

```js
const { VanillaMask, validateCPF } = require("vanilla-mask-js");
```

### Uso Global (Browser)

```html
<script src="path/to/vanilla-mask.min.js"></script>
<script>
   new window.VanillaMask("cpf-input", "cpf", {
      validator: window.validateCPF,
   });
</script>
```

## 📋 Tipos de Máscara Suportados

| Tipo    | Formato              | Exemplo              | Validação  |
| ------- | -------------------- | -------------------- | ---------- |
| `cpf`   | `000.000.000-00`     | `123.456.789-01`     | ✅ Oficial |
| `cnpj`  | `00.000.000/0000-00` | `12.345.678/0001-95` | ✅ Oficial |
| `cep`   | `00000-000`          | `12345-678`          | -          |
| `phone` | `(00) 00000-0000`    | `(11) 98765-4321`    | -          |
| `date`  | `00/00/0000`         | `31/12/2025`         | -          |

## ⚙️ Opções de Configuração

```js
new VanillaMask("input-id", "cpf", {
   // Limpar campo se inválido no blur
   clearIfNotMatch: true,

   // Placeholder personalizado
   placeholder: "",

   // Função de validação customizada
   validator: validateCPF,

   // Mensagem de erro customizada
   errorMessage: "CPF inválido",

   // Idioma (pt, en, es)
   locale: "pt",
});
```

## 🔧 Funções Utilitárias

```js
import {
   formatCPF,
   formatCNPJ,
   formatCEP,
   formatPhone,
   formatDate,
   validateCPF,
   validateCNPJ,
   removeNonDigits,
   applyCustomMask,
   getLocalizedMessage,
   detectLocale,
} from "vanilla-mask-js";

// Formatação direta
const cpf = formatCPF("12345678901"); // "123.456.789-01"

// Validação
const isValid = validateCPF("529.982.247-25"); // true

// Máscara customizada
const custom = applyCustomMask(
   "123456789",
   /(\d{3})(\d{3})(\d{3})/,
   "$1.$2.$3"
);
```

## 🌍 Internacionalização

O sistema detecta automaticamente o idioma do navegador ou pode ser configurado manualmente:

```js
// Detecção automática
new VanillaMask("cpf", "cpf", { validator: validateCPF });

// Idioma específico
new VanillaMask("cpf", "cpf", {
   validator: validateCPF,
   locale: "en", // ou 'es', 'pt'
});
```

### Idiomas Suportados

-  **pt**: Português (Brasil)
-  **en**: English
-  **es**: Español

## ♿ Acessibilidade

O sistema implementa atributos ARIA automaticamente:

-  `aria-invalid="true"` quando há erro de validação
-  `aria-describedby="error-id"` para associar mensagens de erro
-  `role="alert"` nas mensagens de erro
-  `aria-live="polite"` para atualizações dinâmicas

## 🧪 Testes

```bash
npm test
```

## 📁 Estrutura do Projeto

```
vanilla-mask-js/
├── src/
│   └── index.js              # Código principal
├── dist/
│   └── vanilla-mask.min.js   # Versão minificada (opcional)
├── tests/
│   └── vanilla-masks.test.js # Testes unitários
├── README.md                 # Esta documentação
├── package.json              # Metadados do pacote
└── LICENSE                   # Licença MIT
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Reportar bugs
2. Sugerir novas funcionalidades
3. Enviar pull requests

## 📄 Licença

MIT - Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

Inspirado em bibliotecas como jQuery Mask Plugin, VMasker e Cleave.js, mas implementado do zero para máxima performance e compatibilidade moderna.

---

**Desenvolvido por:** José Aparecido Rodrigues Junior
**Repositório:** [GitHub](https://github.com/JoseApRJunior/vanilla-mask-js)
