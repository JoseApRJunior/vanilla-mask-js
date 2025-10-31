/**
 * Testes Unitários para Sistema de Máscaras Vanilla JavaScript
 * Utiliza estrutura de testes simples baseada em console.assert
 */

// ========================================
// CONFIGURAÇÃO DE TESTES
// ========================================

// Simular DOM para testes
if (typeof document === "undefined") {
   global.document = {
      getElementById: (id) => ({
         id,
         value: "",
         setAttribute: () => {},
         addEventListener: () => {},
      }),
      createElement: (tag) => ({
         className: "",
         textContent: "",
         id: "",
         setAttribute: () => {},
      }),
      readyState: "complete",
   };
}

// Carregar o código do sistema de máscaras
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vanillaMasksPath = path.join(
   __dirname,
   "../src/index.js"
);
const code = fs.readFileSync(vanillaMasksPath, "utf8");

// Executar código removendo exports
eval(code.replace(/export\s+.*$/gm, "").replace(/import\s+.*$/gm, ""));

// ========================================
// UTILITÁRIOS DE TESTE
// ========================================

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
   testsRun++;
   try {
      fn();
      console.log(`✅ ${name}`);
      testsPassed++;
   } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      testsFailed++;
   }
}

function assert(condition, message = "Assertion failed") {
   if (!condition) {
      throw new Error(message);
   }
}

function assertEqual(actual, expected, message = "") {
   if (actual !== expected) {
      throw new Error(`${message} Expected ${expected}, got ${actual}`);
   }
}

function assertDeepEqual(actual, expected, message = "") {
   if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
         `${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(
            actual
         )}`
      );
   }
}

// ========================================
// TESTES DAS FUNÇÕES UTILITÁRIAS
// ========================================

console.log("\n🧪 Testando Funções Utilitárias\n");

test("removeNonDigits deve remover caracteres não numéricos", () => {
   assertEqual(removeNonDigits("123-456.789"), "123456789");
   assertEqual(removeNonDigits("abc123def456"), "123456");
   assertEqual(removeNonDigits("!@#$%123^&*()"), "123");
   assertEqual(removeNonDigits(""), "");
});

test("debounce deve funcionar corretamente", () => {
   let counter = 0;
   const debouncedFn = debounce(() => counter++, 50);

   debouncedFn();
   debouncedFn();
   debouncedFn();

   // Simular passagem de tempo
   setTimeout(() => {
      assertEqual(counter, 1, "Debounce deve executar apenas uma vez");
   }, 100);
});

test("applyCustomMask deve aplicar máscara customizada", () => {
   const result = applyCustomMask(
      "123456789",
      /(\d{3})(\d{3})(\d{3})/,
      "$1.$2.$3"
   );
   assertEqual(result, "123.456.789");
});

test("getLocalizedMessage deve retornar mensagens traduzidas", () => {
   assertEqual(getLocalizedMessage("invalidCPF", "pt"), "CPF inválido");
   assertEqual(getLocalizedMessage("invalidCPF", "en"), "Invalid CPF");
   assertEqual(getLocalizedMessage("invalidCPF", "es"), "CPF inválido");
   assertEqual(getLocalizedMessage("nonexistent", "pt"), "nonexistent");
});

test("detectLocale deve detectar idioma do navegador", () => {
   // Simular navigator.language
   const originalNavigator = global.navigator;
   global.navigator = { language: "pt-BR" };

   assertEqual(detectLocale(), "pt");

   global.navigator = { language: "en-US" };
   assertEqual(detectLocale(), "en");

   global.navigator = { language: "es-ES" };
   assertEqual(detectLocale(), "es");

   global.navigator = { language: "fr-FR" };
   assertEqual(detectLocale(), "pt"); // fallback

   global.navigator = originalNavigator;
});

// ========================================
// TESTES DAS FUNÇÕES DE FORMATAÇÃO
// ========================================

console.log("\n🧪 Testando Funções de Formatação\n");

test("formatCPF deve formatar corretamente", () => {
   assertEqual(formatCPF("12345678901"), "123.456.789-01");
   assertEqual(formatCPF("123456789"), "123.456.789");
   assertEqual(formatCPF("123"), "123");
});

test("formatCNPJ deve formatar corretamente", () => {
   assertEqual(formatCNPJ("12345678000195"), "12.345.678/0001-95");
   assertEqual(formatCNPJ("12345678000"), "12.345.678/000");
   assertEqual(formatCNPJ("12345678"), "12.345.678");
});

test("formatCEP deve formatar corretamente", () => {
   assertEqual(formatCEP("12345678"), "12345-678");
   assertEqual(formatCEP("12345"), "12345");
});

test("formatPhone deve formatar corretamente", () => {
   assertEqual(formatPhone("11987654321"), "(11) 98765-4321");
   assertEqual(formatPhone("1187654321"), "(11) 8765-4321");
   assertEqual(formatPhone("118765432"), "(11) 8765-432");
});

test("formatDate deve formatar corretamente", () => {
   assertEqual(formatDate("31122025"), "31/12/2025");
   assertEqual(formatDate("01012025"), "01/01/2025");
   assertEqual(formatDate("3112"), "31/12");
});

// ========================================
// TESTES DOS VALIDADORES
// ========================================

console.log("\n🧪 Testando Validadores\n");

test("validateCPF deve validar CPFs corretamente", () => {
   // CPF válido
   assert(validateCPF("529.982.247-25"), "CPF válido deve retornar true");
   assert(
      validateCPF("52998224725"),
      "CPF válido sem máscara deve retornar true"
   );

   // CPF inválido
   assert(!validateCPF("123.456.789-01"), "CPF inválido deve retornar false");
   assert(
      !validateCPF("111.111.111-11"),
      "CPF com dígitos iguais deve retornar false"
   );
   assert(!validateCPF("123"), "CPF muito curto deve retornar false");
});

test("validateCNPJ deve validar CNPJs corretamente", () => {
   // CNPJ válido
   assert(validateCNPJ("11.958.235/0001-40"), "CNPJ válido deve retornar true");
   assert(
      validateCNPJ("11958235000140"),
      "CNPJ válido sem máscara deve retornar true"
   );

   // CNPJ inválido
   assert(
      !validateCNPJ("12.345.678/0001-95"),
      "CNPJ inválido deve retornar false"
   );
   assert(
      !validateCNPJ("11.111.111/1111-11"),
      "CNPJ com dígitos iguais deve retornar false"
   );
   assert(!validateCNPJ("123"), "CNPJ muito curto deve retornar false");
});

// ========================================
// TESTES DAS CONSTANTES
// ========================================

console.log("\n🧪 Testando Constantes\n");

test("MASK_MAX_LENGTHS deve ter valores corretos", () => {
   assertEqual(MASK_MAX_LENGTHS.cpf, 14);
   assertEqual(MASK_MAX_LENGTHS.cnpj, 18);
   assertEqual(MASK_MAX_LENGTHS.cep, 9);
   assertEqual(MASK_MAX_LENGTHS.phone, 15);
   assertEqual(MASK_MAX_LENGTHS.date, 10);
});

test("MASK_PATTERNS deve ter estruturas corretas", () => {
   assert(Array.isArray(MASK_PATTERNS.cpf), "CPF patterns deve ser array");
   assert(Array.isArray(MASK_PATTERNS.cnpj), "CNPJ patterns deve ser array");
   assert(Array.isArray(MASK_PATTERNS.cep), "CEP patterns deve ser array");
   assert(Array.isArray(MASK_PATTERNS.phone), "Phone patterns deve ser array");
   assert(Array.isArray(MASK_PATTERNS.date), "Date patterns deve ser array");
});

test("I18N_MESSAGES deve ter traduções completas", () => {
   assert(I18N_MESSAGES.pt, "Deve ter mensagens em português");
   assert(I18N_MESSAGES.en, "Deve ter mensagens em inglês");
   assert(I18N_MESSAGES.es, "Deve ter mensagens em espanhol");

   assertEqual(I18N_MESSAGES.pt.invalidFormat, "Formato inválido");
   assertEqual(I18N_MESSAGES.en.invalidFormat, "Invalid format");
   assertEqual(I18N_MESSAGES.es.invalidFormat, "Formato inválido");
});

// ========================================
// TESTES DA CLASSE VANILLAMASK
// ========================================

console.log("\n🧪 Testando Classe VanillaMask\n");

test("VanillaMask deve ser instanciada corretamente", () => {
   const mask = new VanillaMask("test-input", "cpf");
   assert(mask instanceof VanillaMask, "Deve ser instância de VanillaMask");
   assertEqual(mask.type, "cpf");
});

test("VanillaMask deve aceitar opções customizadas", () => {
   const mask = new VanillaMask("test-input", "cpf", {
      clearIfNotMatch: false,
      errorMessage: "Erro customizado",
      locale: "en",
   });

   assertEqual(mask.options.clearIfNotMatch, false);
   assertEqual(mask.options.errorMessage, "Erro customizado");
   assertEqual(mask.options.locale, "en");
});

test("VanillaMask deve detectar locale automaticamente", () => {
   const originalNavigator = global.navigator;
   global.navigator = { language: "en-US" };

   const mask = new VanillaMask("test-input", "cpf");
   assertEqual(mask.options.locale, "en");

   global.navigator = originalNavigator;
});

// ========================================
// RELATÓRIO FINAL
// ========================================

console.log("\n📊 Relatório Final dos Testes\n");
console.log(`Total de testes: ${testsRun}`);
console.log(`✅ Aprovados: ${testsPassed}`);
console.log(`❌ Reprovados: ${testsFailed}`);

if (testsFailed === 0) {
   console.log(
      "\n🎉 Todos os testes passaram! Sistema funcionando corretamente."
   );
} else {
   console.log(
      `\n⚠️  ${testsFailed} teste(s) falharam. Verificar implementação.`
   );
   process.exit(1);
}
