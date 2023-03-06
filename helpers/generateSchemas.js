
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
                    let type = schema.properties[key].type
                    if(type==='array'){
                        type = schema.properties[key].items.type ? `${schema.properties[key].items.type}[]` : '[]'
                    }
                    if(!type){
                        type = 'any'
                    }
                    return `${key}: ${type}\ `
                }).join('\n')}
            }
            `
        }).join('')}
    }
      
    `

    return declaredSchemas
}