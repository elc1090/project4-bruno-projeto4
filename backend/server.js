require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const auth = require("./middleware/auth");

const port = process.env.PORT || 3000;
const dbHost = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
const dbUser = process.env.DB_USER ? process.env.DB_USER : 'postgres';
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'postgres';
const tokenKey = process.env.TOKEN_KEY ? process.env.TOKEN_KEY : '@Trojahn7686';

const db = pgp('postgres://'+ dbUser +':'+ dbPassword + '@'+ dbHost + ':5432/controle_potreiros');

const app = express();
app.use(cors());

app.use(express.static('frontend'))

async function insertVisita(fazenda_id, data) {
    const query = 'INSERT INTO visita (fazenda_id, data) VALUES ($1, $2) RETURNING *';
    const values = [fazenda_id, data];

    return await db.one(query, values);
}

async function insertFazenda(cliente_id, nome) {
    const query = 'INSERT INTO fazenda (cliente_id, nome) VALUES ($1, $2) RETURNING *';
    const values = [cliente_id, nome];

    return await db.one(query, values);
}

async function insertUsuario(nome, email, senha, tipo = 1) {
    const query = 'INSERT INTO usuario (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [nome, email, senha, tipo];

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

async function buscarUsuario(email) {
    const usuario = await db.oneOrNone('SELECT * FROM usuario where email = $1', email);
    return usuario;
}

// Configurar o parser de JSON
app.use(bodyParser.json());

// Rotas Fazenda
app.get('/api/fazenda', auth, (req, res) => {
    db.any('SELECT * FROM fazenda')
        .then(data => {
            res.json({
                data: data,
                is_client: req.user.tipo === 2, 
                error: false
            });
        })
        .catch(error => {
            res.json({ error: true, data: error });
        });
});

app.post('/api/fazenda', auth, async (req, res) => {
    const { cliente_id, nome } = req.body;

    if (!(cliente_id && nome)) {
        return res.status(400).json({ data: "Verifique se informou todos os campos", error: true });
    }

    try {
        const fazenda = await insertFazenda(cliente_id, nome);

        res.json({ data: fazenda });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }

});

app.delete('/api/fazenda/:id', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM fazenda WHERE id = $1', req.params.id);

        res.json({ error: false });
    } catch(error) {
        res.status(500).json({ data: error, error: true });
    }
});

// Rotas Visita
app.get('/api/visita', auth, (req, res) => {
    let query = '';
    let values = [];

    if (req.user.tipo === 1) {
        query = 'SELECT visita.*, visita.id as idvisita, sugestaomanejo.*, fazenda.Nome as NomeFazenda FROM visita left join sugestaomanejo on visita.id = sugestaomanejo.visita_id join fazenda on fazenda.id = visita.fazenda_id order by visita.data desc';
    } else if(req.user.tipo === 2) {
        query = 'SELECT visita.*, visita.id as idvisita, sugestaomanejo.*, fazenda.Nome as NomeFazenda FROM visita left join sugestaomanejo on visita.id = sugestaomanejo.visita_id join fazenda on fazenda.id = visita.fazenda_id join cliente on cliente.id = fazenda.cliente_id where cliente.usuario_id = $1 order by visita.id desc';
        values = [req.user.user_id];
    }

    db.any(query, values)
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

            res.json({
                data: visitasReestruturadas, 
                is_client: req.user.tipo === 2, 
                error: false
            });
        })
        .catch(error => {
            res.json({ error: true, data: error });
        });
});

app.get('/api/visita/:id', auth, async (req, res) => {
    let visitaId = req.params.id;
    try {
        const visita = await db.oneOrNone('SELECT visita.*, fazenda.nome as nomefazenda FROM visita join fazenda on fazenda.id = visita.fazenda_id WHERE visita.id = $1', visitaId);
        if (!visita) {
            return res.status(404).json({ error: 'Visita não encontrada' });
        }

        const sugestoes = await db.any('SELECT * FROM sugestaomanejo WHERE visita_id = $1', visitaId);

        visita.sugestoes = sugestoes;

        res.json({
            data: visita,
            is_client: req.user.tipo === 2,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, data: error });
    }
});

app.post('/api/visita', auth, async (req, res) => {
    const { fazenda_id, data } = req.body;

    if (!(fazenda_id && data)) {
        return res.status(400).json({ data: "Verifique se informou todos os campos", error: true });
    }

    try {
        const visita = await insertVisita(fazenda_id, data);

        res.json({ data: visita });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }

});

// Rotas Cliente
app.get('/api/cliente', auth, (req, res) => {
    if(req.user.tipo === 1) {
        db.any('SELECT * FROM cliente where consultor_id = $1 and status = 1', req.user.user_id)
            .then(data => {
                res.json({ data: data });
            })
            .catch(error => {
                res.json({ error: true, is_client: false, data: error });
            });
    } else {
        res.json({ data: [], is_client: true, error: false });
    }
});

app.delete('/api/cliente/:id', auth, async (req, res) => {
    try {
        await db.query('UPDATE cliente set status = 0 WHERE id = $1', req.params.id);

        res.json({ error: false });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }
});

app.post('/api/cliente', auth, async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!(nome && email && senha)) {
        return res.status(400).json({ data: "Verifique se informou todos os campos", error: true });
    }

    try {
        const usuarioAntigo = await buscarUsuario(email);

        if (usuarioAntigo) {
            return res.status(409).json({ data: "Usuário ja existe", error: true });
        }

        const senhaCriptograda = await bcrypt.hash(senha, 10);
        const usuario = await insertUsuario(nome, email, senhaCriptograda, 2);

        const query = 'INSERT INTO cliente (nome, consultor_id, usuario_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [nome, req.user.user_id, usuario.id];

        const cliente = await db.one(query, values);

        res.json({ data: cliente });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }

});

// Rotas Sugestao manejo
app.post('/api/sugestao_manejo', auth, async (req, res) => {
    const { campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id  } = req.body;

    try {
        const sugestao = await insertSugestaoManejo(campo, area, pastagem, altura, categoria, cabecas, peso, carga, cc, sanidade, sugestoes, visita_id);

        res.json({ data: sugestao });
    } catch (error) {
        res.status(500).json({ data: error, error: true });
    }
});

// login e cadastro
app.post('/api/usuario', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!(email && nome && senha)) {
        return res.status(400).json({ data: "Verifique se informou todos os campos", error: true });
    }

    const usuarioAntigo = await buscarUsuario(email);

    if (usuarioAntigo) {
        return res.status(409).json({ data: "Usuário ja existe", error: true });
    }

    try {
        const senhaCriptograda = await bcrypt.hash(senha, 10);
        const usuario = await insertUsuario(nome, email, senhaCriptograda);

        return res.json({ data: usuario });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ data: error, error: true });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!(email && senha)) {
            return res.status(400).json({ data: "Verifique se informou todos os campos", error: true });
        }

        const usuario = await buscarUsuario(email);

        if (usuario && (await bcrypt.compare(senha, usuario.senha))) {

            const token = jwt.sign(
                {
                    user_id: usuario.id,
                    email,
                    tipo: usuario.tipo
                },
                tokenKey,
                {
                    expiresIn: "24h",
                }
            );

            return res.status(200).json({data: token, error: false});
        }

        res.status(400).json({error: true, data: "Usuário ou senha incorretos" });
    } catch (error) {
        //console.log(error);
        res.status(500).json({ data: error, error: true });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
