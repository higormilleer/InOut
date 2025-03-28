const fs = require("fs").promises;
const path = require("path");

// Caminhos dos arquivos
const inputFile = process.argv[2]; // O arquivo JSON será passado como argumento
const outputDir = path.join(__dirname, "resultado"); // Pasta fixa "resultado"
const outputFile = path.join(outputDir, "FMB_load_sample.txt"); // Nome fixo do arquivo de saída

// Função para verificar se o arquivo existe
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
    } catch (err) {
        throw new Error(`Erro: O arquivo "${filePath}" não foi encontrado.`);
    }
}

// Função para ler e validar o conteúdo do arquivo JSON
async function readJSON() {
    try {
        await checkFileExists(inputFile);

        const data = await fs.readFile(inputFile, "utf8");
        const jsonData = JSON.parse(data);

        return jsonData;
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

// Função para formatar o JSON em um formato de texto mais legível
function formatJsonToText(jsonData) {
    return JSON.stringify(jsonData, null, 2); // Converte o JSON para texto de forma formatada
}

// Função principal para executar o processo
async function main() {
    if (!inputFile) {
        console.error("Erro: O caminho do arquivo JSON de entrada deve ser fornecido.");
        process.exit(1);
    }

    // Criar a pasta "resultado" se ela não existir
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        console.error("Erro ao criar a pasta de resultado:", err);
        process.exit(1);
    }

    const jsonData = await readJSON();
    const output = formatJsonToText(jsonData);

    // Escrever o conteúdo formatado no arquivo TXT dentro da pasta "resultado"
    try {
        await fs.writeFile(outputFile, output, "utf8");
        console.log(`✅ Arquivo salvo em: "${outputFile}"`);
    } catch (err) {
        console.error("Erro ao escrever o arquivo:", err);
    }
}

// Chama a função principal
main();
