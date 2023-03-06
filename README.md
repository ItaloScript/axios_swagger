# Axios Swagger

axios_swagger is a javascript lib that transform swagger schemas in to axios http requests

## Get Started

```
  yarn add axios_swagger
```
```
  npm install axios_swagger
```

## Config

| add axios_swagger.json file in root folder

```
{
    "swaggerUrl": "http://localhost:3000/api-json",
    "outputPath": "./services"
}
```

## Run

```
yarn axios_swagger
```

## GeneratedFiles
```
base.ts
schemas.d.ts
services.ts
```
