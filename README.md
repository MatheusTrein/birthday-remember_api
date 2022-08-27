# Birthday Remember API

Birthday Remember é uma plataforma que ajuda o usuário a lembrar dos aniversários dos seus entes queridos através de um lembrete por e-mail. A plataforma foi construída como proposta própria de estudo. Resolvi colocar online para quem quer usar e testar. Tudo em prol do desenvolvimento técnico.

# Repositório do front-end
- [BirthdayRememberWeb](https://github.com/MatheusTrein/birthday-remember_web)

# Link do site:
[www.birthdayremember.com](https://www.birthdayremember.com)

## Tecnologias utilizadas
- [Docker](https://www.docker.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/pt-br/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Bull](https://www.npmjs.com/package/bull)
- [TypeORM](https://typeorm.io/#/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Jest](https://jestjs.io/pt-BR/)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Tsyringe](https://www.npmjs.com/package/tsyringe)
- [Celebrate](https://www.npmjs.com/package/celebrate)
- [AWS-S3](https://aws.amazon.com/pt/s3/)
- [AWS-EC2](https://aws.amazon.com/pt/ec2/)
- [AmazonSES](https://aws.amazon.com/pt/ses/)

# Como rodar o projeto

Depois de clonar o repósitiorio no seu computador, é preciso instalar as dependências usando o [yarn](https://yarnpkg.com/) ou o [npm](https://www.npmjs.com/).

```bash
yarn
```
ou

```bash
npm install
```

## Varáveis de ambiente

Criar um arquivo nomeado ".env" e registrar as variaveis de ambiente descritas no arquivo de exemplo ".env.example"

Criar um arquivo nomeado "docker-compose.yml" baseado no "docker-compose-dev.example.yml"

Verificar as portas dos containers no "docker-compose.yml"

## Docker

Depois de instalar todas as dependências, é necessário criar a imagem e subir os containers. Para fazer isso você deve rodar o seguinte comando na raiz do projeto:

```javascript
docker-compose up -d
```

Para verificar o log da aplicação, rode este comando:

```javascript
docker logs -f birthday-remember_api
```

## Testes

Para isso rode o seguinte comando:

```javascript
yarn test
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
