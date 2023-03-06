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

console.log('Starting axios-swagger')


async function init() {

    if (existsSync("axios_swagger.json")) {
        dataConfig = JSON.parse(readFileSync("axios_swagger.json").toString())
    } else {
        console.log('You do not have a axios_swagger.json file, creating one...')
        console.log('Please configure the file with the correct data, then run the command again')
        writeFileSync("axios_swagger.json", JSON.stringify({
            "swaggerUrl": "http://localhost:3000/api-json",
            "outputPath": "./services"
        }, null, 4))
        return
    }
    
    mkdirSync(dataConfig.outputPath, { recursive: true })

    
    console.log('Generating schemas...')
    
    let data = await axios.get(dataConfig.swaggerUrl).catch(err => {
        return false
    })

    if (!data) {
        console.log('Fail to connect to url, are your url correct?\nexemple: http://localhost:3000/api-json \nactual_url: ' + dataConfig.swaggerUrl + '\n\n')
        return
    }

    data = data.data

    await generateSchemasAction(data)

    console.log('Generating services...')
    await generateServicesAction(data)

    console.log('Services generated successfully!')


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
