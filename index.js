#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import axios from 'axios'
import generateSchemas from "./helpers/generateSchemas.js"
import { exec, execSync } from "child_process";
import generateServices from "./helpers/generateServices.js";

if (!existsSync('services')) {
    mkdirSync('services')
}

let dataConfig = {
    "swaggerUrl": "http://localhost:3000/api-json",
    "outputPath": "./services"
}

console.log('Gerando arquivos de configurações...')

if (existsSync("typeswagger.json")) {
    dataConfig = JSON.parse(readFileSync("typeswagger.json").toString())
} else {
    writeFileSync("typeswagger.json", JSON.stringify({
        "swaggerUrl": "http://localhost:3000/api-json",
        "outputPath": "./services"
    }))
}

mkdirSync(dataConfig.outputPath, { recursive: true })

async function init() {

    console.log('Gerando schemas...')
    
    let data = await axios.get(dataConfig.swaggerUrl).catch(err => {
        return false
    })

    if (!data) {
        console.log('Falha ao se conectar a url, verifique se o swagger está rodando \nexemplo: http://localhost:3000/api-json \nurl_atual: ' + dataConfig.swaggerUrl + '\n\n')
        return
    }

    data = data.data

    await generateSchemasAction(data)

    console.log('Gerando services...')
    await generateServicesAction(data)

    console.log('Serviços criados com sucesso')


}

async function generateSchemasAction(data) {
    const declaredSchemas = await generateSchemas(data.components.schemas)
    writeFileSync(`${dataConfig.outputPath}/schemas.d.ts`, declaredSchemas)
    const declaredSchemasFormmated = execSync(`yarn tsfmt ${dataConfig.outputPath}/schemas.d.ts`).toString().split('\n').slice(1).join('\n')
    writeFileSync(`${dataConfig.outputPath}/schemas.d.ts`, declaredSchemasFormmated)
}

async function generateServicesAction(data) {
    const stringFile = await generateServices(data)
    writeFileSync(`${dataConfig.outputPath}/services.ts`, stringFile)
    const stringFileFormmated = execSync(`yarn tsfmt ${dataConfig.outputPath}/services.ts`).toString().split('\n').slice(1).join('\n')
    writeFileSync(`${dataConfig.outputPath}/services.ts`, stringFileFormmated)
}

init()
