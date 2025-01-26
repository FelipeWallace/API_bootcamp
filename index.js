const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);

// Middleware para autenticação de token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']; // Espera o token no cabeçalho Authorization

    if (!token) {
        return res.status(401).json({ message: 'Token é obrigatório' });
    }

    if (token !== `Bearer ${config.apiToken}`) {
        return res.status(403).json({ message: 'Token inválido' });
    }

    next(); // Continua para a próxima função, pois o token é válido
};

// Conexão com o banco de dados
client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

// Rota pública
app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Server is running.");
});

// Rotas protegidas
app.use(authenticateToken);

app.get("/todolist", (req, res) => {
    try {
        client.query("SELECT * FROM todolist", function (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Rota: get usuarios");
        });
    } catch (error) {
        console.log(error);
    }
});

app.post("/todolist", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { task, done } = req.body;
        client.query("INSERT INTO todolist (task, done) VALUES ($1, $2) RETURNING *", [task, done],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

// Inicialização do servidor
app.listen(config.port, () =>
    console.log("Server running on port " + config.port)
);
