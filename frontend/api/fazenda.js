require('dotenv').config();

const pgp = require('pg-promise')();
const dbHost = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
const dbUser = process.env.DB_USER ? process.env.DB_USER : 'postgres';
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'postgres';

const db = pgp('postgres://' + dbUser + ':' + dbPassword + '@' + dbHost + ':5432/controle_potreiros?ssl=true');

export default function fazenda (req, res) {
    db.any('SELECT * FROM fazenda')
        .then(data => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ data: data });
        })
        .catch(error => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ error: true, data: error });
        });
};