
export default function generateSchemas(schemas){
    //json to array
    const schemasArray = Object.keys(schemas).map(key => {
        return {...schemas[key], title: key}
    })

    const declaredSchemas = `declare namespace API {\n\
        ${schemasArray.map(schema => {
            return `
            export interface ${schema.title} {
                ${Object.keys(schema.properties).map(key => {
                    return `${key}: ${schema.properties[key].type}\ `
                }).join('\n')}
            }
            `
        }).join('')}
    }
      
    `

    return declaredSchemas
}