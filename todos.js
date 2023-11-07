const express = require('express');
const router = express.Router();
const db = require('./db');

// API-endpunkt för att hämta alla "todos"
router.get('/', (req, res) => {
  const query = 'SELECT * FROM Todos'; 
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Kunde inte hämta "todos"' });
    } else {
      res.json(results);
    }
  });
});

// API-endpunkt för att skapa en ny "todo"
router.post('/', (req, res) => {
    const { description } = req.body;

    const query = 'INSERT INTO todos (description) VALUES (?)';
    db.query(query, [description], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Kunde inte skapa "todo"' });
      } else {
        const newTodoId = result.insertId; 
        res.json({ message: 'Ny "todo" har skapats med ID ' + newTodoId });
      }
    });
  });

// API-endpunkt för att uppdatera en "todo" med ett specifikt ID
router.put('/:id', (req, res) => {
    const todoId = req.params.id;
    const { description } = req.body; 
    const query = 'UPDATE todos SET description = ? WHERE id = ?';
    db.query(query, [description, todoId], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Kunde inte uppdatera "todo"' });
      } else {
        res.json({ message: 'Todo med ID ' + todoId + ' har uppdaterats' });
      }
    });
  });
  
//API-endpoint för att ta bort en todo
router.delete('/:id', (req, res) => {
    const todoId = req.params.id;
    const query = 'DELETE FROM todos WHERE id = ?';
    db.query(query, [todoId], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Kunde inte ta bort "todo"' });
      } else {
        res.json({ message: 'Todo med ID ' + todoId + ' har tagits bort' });
      }
    });
  });

module.exports = router;