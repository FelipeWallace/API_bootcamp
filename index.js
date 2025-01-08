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

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Server is running.");
});

app.listen(config.port, () =>
    console.log("Server running port" + config.port)
);

app.get("/todolist", (req, res) => {
    try {
        client.query("SELECT * FROM todolist", function
            (err, result) {
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

// app.post("/usuarios", (req, res) => {
//     try {
//         console.log("Alguém enviou um post com os dados:", req.body);
//         const { nome, email, altura, peso } = req.body;
//         client.query(
//             "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2, $3, $4) RETURNING * ", [nome, email, altura, peso],
//             (err, result) => {
//                 if (err) {
//                     return console.error("Erro ao executar a qry de INSERT", err);
//                 }
//                 const { id } = result.rows[0];
//                 res.setHeader("id", `${id}`);
//                 res.status(201).json(result.rows[0]);
//                 console.log(result);
//             }
//         );
//     } catch (erro) {
//         console.error(erro);
//     }
// });
