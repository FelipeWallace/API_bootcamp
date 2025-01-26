const dotenv = require('dotenv');
dotenv.config();

const {
    PORT,
    pgConnection,
    apiToken
} = process.env;

module.exports = {
    port: PORT,
    urlConnection: pgConnection,
    apiToken: `Bearer ${apiToken}`, //apiToken
}