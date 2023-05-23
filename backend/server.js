require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();

const port = process.env.PORT || 3000;
const dbHost = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
const dbUser = process.env.DB_USER ? process.env.DB_USER : 'postgres';
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'postgres';

const db = pgp('postgres://'+ dbUser +':'+ dbPassword + '@'+ dbHost + ':5432/controle-potreiros');

const app = express();
app.use(cors());

app.use(express.static('frontend'))

async function insertVisita(fazenda_id, data) {
    const query = 'INSERT INTO visita (fazenda_id, data) VALUES ($1, $2) RETURNING *';
    const values = [fazenda_id, data];

    return await db.one(query, values);
}

async function insertSugestaoManejo(campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id) {
    let query = 'INSERT INTO sugestaomanejo (campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
    let values = [
        campo, 
        area.length ? area : null, 
        pastagem, 
        altura.length ? altura : null, 
        categoria.length ? categoria : null, 
        cabecas.length ? cabecas : null, 
        peso.length ? peso : null, 
        carga.length ? carga : null, 
        cc.length ? cc : null, 
        sanidade.length ? sanidade : null, 
        sugestoes, 
        visita_id
    ];

    return await db.one(query, values);
}

// Configurar o parser de JSON
app.use(bodyParser.json());

// Rotas GET
app.get('/api/fazenda', (req, res) => {
    db.any('SELECT * FROM fazenda')
        .then(data => {
            res.json({ data: data });
        })
        .catch(error => {
            res.json({ error: true, data: error });
        });
});

app.get('/api/visita', (req, res) => {
    db.any('SELECT visita.*, visita.id as idvisita, sugestaomanejo.*, fazenda.Nome as NomeFazenda FROM visita left join sugestaomanejo on visita.id = sugestaomanejo.visita_id join fazenda on fazenda.id = visita.fazenda_id')
        .then(data => {

            const visitasReestruturadas = data.reduce((acc, visita) => {
                const { idvisita, data, nomefazenda, ...sugestao } = visita;
                const visitaExistente = acc.find(item => item.id === idvisita);

                let visita_data = new Date(data).toLocaleDateString('pt-BR');
                if (visitaExistente) {
                    visitaExistente.sugestoes.push(sugestao);
                } else {
                    acc.push({
                        id: idvisita,
                        visita_data,
                        nome_fazenda: nomefazenda,
                        sugestoes: sugestao.id ? [sugestao] : [],
                    });
                }

                return acc;
            }, []);
            res.json({ data: visitasReestruturadas });
        })
        .catch(error => {
            res.json({ error: true, data: error });
        });
});

app.get('/api/visita/:id', async (req, res) => {
    let visitaId = req.params.id;
    try {
        const visita = await db.oneOrNone('SELECT visita.*, fazenda.nome as nomefazenda FROM visita join fazenda on fazenda.id = visita.fazenda_id WHERE visita.id = $1', visitaId);
        if (!visita) {
            return res.status(404).json({ error: 'Visita não encontrada' });
        }

        const sugestoes = await db.any('SELECT * FROM sugestaomanejo WHERE visita_id = $1', visitaId);

        visita.sugestoes = sugestoes;

        res.json(visita);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, data: error });
    }
});

// Rota POST
app.post('/api/visita', async (req, res) => {
    const { fazenda_id, data  } = req.body;

    try {
        const visita = await insertVisita(fazenda_id, data);

        res.json({ data: visita });
    } catch(error) {
        res.status(500).json({ data: error, error: true });
    }
    
});

app.post('/api/sugestao_manejo', async (req, res) => {
    const { campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id  } = req.body;

    try {
        const sugestao = await insertSugestaoManejo(campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id);

        res.json({ data: sugestao });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
