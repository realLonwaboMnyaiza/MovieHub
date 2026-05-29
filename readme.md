# Movie Hub NodeJs API

Backend NodeJs API application used for viewing all the movies we have to offer.

## Tech Stack

- JavaScript / TypeScript
- JWT
- ViTest
- NodeJs
- Express
- MongoDb

## Getting Started

- Install Dependencies:
  `npm install` / `npm i`
- Install MongoDb
  - check status of Mongo daemon `systemctl status mongod.service`
  - start MongoDB `sudo systemctl start mongod.service`
- Run Test Locally `npm test` / `npm t`
- Lint App `npm lint`
- Format using code standards `npm format`
- Check Types `npm type-check`

---

- Run App Locally `npm start` / Hot Reload with: `nodemon` (\*package is installed)
- Use REST Client i.e. Postman to query movies.

## Future Features

1. Accompanying .NET API.
2. Application Architectural Diagram.
3. NginX (reverse proxy & load balancing).
4. Redis as caching layer.
5. Containerize Application via Docker.
6. API documentation. (Swagger)
