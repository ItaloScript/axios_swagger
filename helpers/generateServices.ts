export default function generateServices(data){
    const services = data.paths
    const servicesArray = Object.keys(services).map(key => {
        return {...services[key],url: key }
    })

    const allMethods = servicesArray.reduce((acc, service) => {
        return [...acc, ...Object.keys(service).
            filter(key=>key!=='url').map(key => {
                const title = service[key].operationId.split('Controller_').at(1)
                return ({...service[key], url: service.url, title, method: key
                    } )
            })]
    }, [])
    
    const methodsMap = new Map()

    for (const method of allMethods) {
        const serviceName = method.operationId.split('Controller_').at(0)
        if(methodsMap.has(serviceName)){
            methodsMap.set(serviceName, [...methodsMap.get(serviceName), method])
        }else{
            methodsMap.set(serviceName, [method])
        }
    }
    const keys = [...methodsMap.keys()]

    const servicesString = `
    import axios from 'axios'


    export const services = {
        ${keys.map(key => {
            return `${key}: {
                ${methodsMap.get(key).map(method => {
                    return `
                    ${method.title}: ${createServiceFunction({...method, key: key})}`
                })
            }`
        })}
            
        }
    }`

    return servicesString
}

function createServiceFunction(method){
    let stringFunction = `
        async ( #PARAMS ) : #RETURN => {
            return axios.#METHOD(#URL, #HAS_BODY, #QUERY_PARAMS)
        }
    `

    let pathParameters = method.parameters.filter(parameter => parameter.in === 'path').map(x=> 
        x.name + ':' + x.schema.type 
    ).join(', ')

    let hasBodyParameters = method.requestBody?.content['application/json'].schema?.['$ref']?.split('/').at(-1)

    let hasQueryParameters = method.parameters.filter(parameter => parameter.in === 'query').map(x=> 
        x.name + ':' + x.schema.type
    ).join(', ')


    pathParameters = ((hasBodyParameters || hasQueryParameters) && pathParameters.length) ? pathParameters + ', ' : pathParameters
    hasBodyParameters = (hasQueryParameters && pathParameters.length) ? hasBodyParameters + ', ' : hasBodyParameters
    


    let params = pathParameters + (hasBodyParameters ? `body:API.${hasBodyParameters} ` : '') + (hasQueryParameters ? `queryData: {${
        hasQueryParameters
    }}`: '')

    let schemaResponse = (method.responses['200'] || method.responses['201'])?.content?.['application/json']?.schema
    schemaResponse = {
        type: schemaResponse?.type,
        ref: ((schemaResponse?.['$ref'] || schemaResponse?.['items']?.['$ref'])?.split('/').at(-1))
    }


    stringFunction = stringFunction.replace('#PARAMS', params)
    stringFunction = stringFunction.replace(', #HAS_BODY',  hasBodyParameters ? ', body' : '')
    stringFunction = stringFunction.replace(', #QUERY_PARAMS', hasQueryParameters ? ', { params:queryData }' : '')
    stringFunction = stringFunction.replace('#RETURN',  schemaResponse.ref ? (schemaResponse.type === 'array' ? `Promise<API.${schemaResponse.ref}[]>` : `Promise<API.${schemaResponse.ref}>`)  : 'Promise<any>')
    stringFunction = stringFunction.replace('#METHOD', method.method)
    stringFunction = stringFunction.replace('#URL', pathParameters.length ? `\`${method.url}\`` : `'${method.url}'`)
    stringFunction = stringFunction.replace(/{(\w+)}/g, (match, key) => {
       return '${' + key + '}'
    })


    return stringFunction

}