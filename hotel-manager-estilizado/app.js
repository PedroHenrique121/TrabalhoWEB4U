const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('mysql2');

const app = express();


app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const db = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'pedrobolo12', 
  database: 'hotel_manager'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL conectado');
});

app.get('/', (req, res) => res.render('home'));



app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, clientes) => {
    res.render('clientes/index', { clientes });
  });
});

app.get('/clientes/novo', (req, res) => res.render('clientes/novo'));

app.post('/clientes/novo', (req, res) => {
  const { nome, cpf } = req.body;
  db.query(
    'INSERT INTO clientes (nome, cpf) VALUES (?, ?)',
    [nome, cpf],
    () => res.redirect('/clientes')
  );
});



app.get('/reservas', (req, res) => {
  const sql = `
    SELECT r.*, c.nome AS cliente
    FROM reservas r
    JOIN clientes c ON c.id = r.cliente_id
  `;
  db.query(sql, (err, reservas) => {
    res.render('reservas/index', { reservas });
  });
});

app.get('/reservas/novo', (req, res) => {
  db.query('SELECT * FROM clientes', (err, clientes) => {
    res.render('reservas/novo', { clientes });
  });
});

app.post('/reservas/novo', (req, res) => {
  const { cliente_id, quarto, dias, tipo } = req.body;
  db.query(
    'INSERT INTO reservas (cliente_id, quarto, dias, tipo) VALUES (?, ?, ?, ?)',
    [cliente_id, quarto, dias, tipo],
    () => res.redirect('/reservas')
  );
});

app.post('/reservas/excluir/:id', (req, res) => {
  db.query(
    'DELETE FROM reservas WHERE id = ?',
    [req.params.id],
    () => res.redirect('/reservas')
  );
});



app.get('/produtos', (req, res) => {
  db.query('SELECT * FROM produtos', (err, produtos) => {
    res.render('produtos/index', { produtos });
  });
});

app.get('/produtos/novo', (req, res) => res.render('produtos/novo'));

app.post('/produtos/novo', (req, res) => {
  const { nome, preco } = req.body;
  db.query(
    'INSERT INTO produtos (nome, preco) VALUES (?, ?)',
    [nome, preco],
    () => res.redirect('/produtos')
  );
});



app.get('/funcionarios', (req, res) => {
  const sql = `
    SELECT f.*, g.nome AS gerente
    FROM funcionarios f
    LEFT JOIN gerentes g ON g.id = f.gerente_id
  `;
  db.query(sql, (err, funcionarios) => {
    res.render('funcionarios/index', { funcionarios });
  });
});

app.get('/funcionarios/novo', (req, res) => {
  db.query('SELECT * FROM gerentes', (err, gerentes) => {
    res.render('funcionarios/novo', { gerentes });
  });
});

app.post('/funcionarios/novo', (req, res) => {
  const { nome, cargo, gerente_id } = req.body;
  db.query(
    'INSERT INTO funcionarios (nome, cargo, gerente_id) VALUES (?, ?, ?)',
    [nome, cargo, gerente_id],
    () => res.redirect('/funcionarios')
  );
});


app.get('/fundadores', (req, res) => {
  db.query('SELECT * FROM fundadores', (err, fundadores) => {
    res.render('fundadores/index', { fundadores });
  });
});

app.get('/fundadores/novo', (req, res) => {
  res.render('fundadores/novo');
});

app.post('/fundadores/novo', (req, res) => {
  const { nome, participacao, data_fundacao } = req.body;

  db.query(
    'INSERT INTO fundadores (nome, participacao, data_fundacao) VALUES (?, ?, ?)',
    [nome, participacao, data_fundacao],
    () => res.redirect('/fundadores')
  );
});

app.get('/fundadores/editar/:id', (req, res) => {
  db.query(
    'SELECT * FROM fundadores WHERE id = ?',
    [req.params.id],
    (err, result) => {
      res.render('fundadores/editar', { fundador: result[0] });
    }
  );
});

app.post('/fundadores/editar/:id', (req, res) => {
  const { nome, participacao, data_fundacao } = req.body;

  db.query(
    'UPDATE fundadores SET nome=?, participacao=?, data_fundacao=? WHERE id=?',
    [nome, participacao, data_fundacao, req.params.id],
    () => res.redirect('/fundadores')
  );
});

app.post('/fundadores/excluir/:id', (req, res) => {
  db.query(
    'DELETE FROM fundadores WHERE id = ?',
    [req.params.id],
    () => res.redirect('/fundadores')
  );
});



app.get('/estacionamento', (req, res) => {
  db.query('SELECT * FROM estacionamento', (err, results) => {
    if (err) throw err;
    res.render('estacionamento/index', { estacionamento: results });
  });
});


app.get('/estacionamento/novo', (req, res) => {
  res.render('estacionamento/novo');
});

app.post('/estacionamento/novo', (req, res) => {
  const { placa, vaga } = req.body;
  db.query('INSERT INTO estacionamento (placa, vaga) VALUES (?, ?)', [placa, vaga], (err) => {
    if (err) throw err;
    res.redirect('/estacionamento');
  });
});


app.get('/estacionamento/editar/:id', (req, res) => {
  db.query('SELECT * FROM estacionamento WHERE id = ?', [req.params.id], (err, results) => {
    if (err) throw err;
    res.render('estacionamento/editar', { estacionamento: results[0] });
  });
});

app.post('/estacionamento/editar/:id', (req, res) => {
  const { placa, vaga } = req.body;
  db.query(
    'UPDATE estacionamento SET placa = ?, vaga = ? WHERE id = ?',
    [placa, vaga, req.params.id],
    (err) => {
      if (err) throw err;
      res.redirect('/estacionamento');
    }
  );
});


app.post('/estacionamento/excluir/:id', (req, res) => {
  db.query('DELETE FROM estacionamento WHERE id = ?', [req.params.id], (err) => {
    if (err) throw err;
    res.redirect('/estacionamento');
  });
});





app.get('/relatorios', (req, res) => {
  const queries = [
    'SELECT COUNT(*) total FROM clientes',
    'SELECT COUNT(*) total FROM reservas',
    'SELECT COUNT(*) total FROM produtos',
    'SELECT COUNT(*) total FROM funcionarios',
    'SELECT COUNT(*) total FROM estacionamento'
  ];

  Promise.all(
    queries.map(q => new Promise(resolve => {
      db.query(q, (err, r) => resolve(r[0].total));
    }))
  ).then(([clientes, reservas, produtos, funcionarios, vagas]) => {
    res.render('relatorios', {
      totalClientes: clientes,
      totalReservas: reservas,
      totalProdutos: produtos,
      totalFuncionarios: funcionarios,
      totalVagas: vagas
    });
  });
});



const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
