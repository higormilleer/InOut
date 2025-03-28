const fs = require("fs").promises; 
const path = require("path");

// Caminhos dos arquivos
const inputFile = path.join(__dirname, ".idea", "FMB_load_sample.json");
const outputFile = path.join(__dirname, "FMB_load_sample.txt");

// Funcao para verificar se o arquivo existe
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
    } catch (err) {
        throw new Error(`Erro: O arquivo "${filePath}" nao foi encontrado.`);
    }
}

// Funcao para ler e validar o conteudo do arquivo "JSON"
async function readAndValidateJSON() {
    try {
        await checkFileExists(inputFile);

        const data = await fs.readFile(inputFile, "utf8");
        const jsonData = JSON.parse(data);

        // Validacao de schema e version
        if (!jsonData.schema || !jsonData.version) {
            throw new Error("Erro: O arquivo nao contem um schema ou version validos.");
        }

        const validSchema = "FMB_load";
        const validVersion = "1.0";
        if (jsonData.schema !== validSchema || jsonData.version !== validVersion) {
            throw new Error(`Erro: O schema ou a versao nao correspondem aos valores esperados (esperado: ${validSchema} v${validVersion}).`);
        }

        return jsonData;
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

// Funcao para formatar o JSON para o formato de texto que seja de mais facil leitura
function formatJsonToText(jsonData) {
    let output = "";

    // Verificacao e formatacao das secoes
    if (jsonData.schema) output += `Schema: ${jsonData.schema}\n`;
    if (jsonData.version) output += `Version: ${jsonData.version}\n`;

    output += formatSection("Users", jsonData.users);
    output += formatSection("Devices", jsonData.devices);
    output += formatSection("Species", jsonData.species);
    output += formatParameters(jsonData.parameters);
    output += formatPlots(jsonData.plots);

    return output;
}

// Funcao para formatar uma secao
function formatSection(sectionName, data) {
    let output = "";
    if (Array.isArray(data) && data.length > 0) {
        output += `\n${sectionName}:\n`;
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                output += `  - ${key}: ${item[key]}\n`;
            });
            output += "-".repeat(50) + "\n";
        });
    }
    return output;
}

// Funcao para formatar os parametros
function formatParameters(parameters) {
    let output = "\nParameters:\n";
    if (Array.isArray(parameters) && parameters.length > 0) {
        parameters.forEach(param => {
            if (param.name && param.value && param.type) {
                output += `  - Name: ${param.name}\n`;
                output += `    Value: ${param.value}\n`;
                output += `    Type: ${param.type}\n`;
                output += `    Allowed Values: ${param.allowedValues || "N/A"}\n`;
                output += `    Default Value: ${param.defaultValue || "N/A"}\n`;
                output += `    Description: ${param.description || "N/A"}\n`;
                output += `    Group: ${param.group || "N/A"}\n`;
                output += "-".repeat(50) + "\n";
            }
        });
    }
    return output;
}

// Funcao para formatar os plots
function formatPlots(plots) {
    let output = "\nPlots:\n";
    if (Array.isArray(plots) && plots.length > 0) {
        plots.forEach(plot => {
            output += `  - Inventory Type: ${plot.inventoryType}\n`;
            output += `    Farm Code: ${plot.farmCod}\n`;
            output += `    Stand Code: ${plot.standCod}\n`;
            output += `    Plot Code: ${plot.plotCod}\n`;
            output += `    Plot Area: ${plot.plotArea}\n`;
            output += `    Plot Type: ${plot.plotType}\n`;
            output += `    Latitude: ${plot.latitude}\n`;
            output += `    Longitude: ${plot.longitude}\n`;

            // Formatar arvores dentro de cada plot
            if (Array.isArray(plot.trees) && plot.trees.length > 0) {
                output += `    Trees:\n`;
                plot.trees.forEach(tree => {
                    output += `      - Line: ${tree.line}\n`;
                    output += `        Tree: ${tree.tree}\n`;
                    output += `        Diameter: ${tree.diameter}\n`;
                    output += `        Height: ${tree.height}\n`;
                    output += `        Quality Code: ${tree.qualityCode}\n`;
                    output += `        Dominant: ${tree.dominant}\n`;
                    output += "-".repeat(50) + "\n";
                });
            }
        });
    }
    return output;
}

// Funcao principal para executar o processo
async function main() {
    const jsonData = await readAndValidateJSON();
    const output = formatJsonToText(jsonData);

    // Escrever o conteudo formatado no arquivo "TXT"
    try {
        await fs.writeFile(outputFile, output, "utf8");
        console.log(`✅ Arquivo "${outputFile}" gerado com sucesso!`);
    } catch (err) {
        console.error("Erro ao escrever o arquivo:", err);
    }
}

// Chama a funcao principal
main();
