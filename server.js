const express = require('express');
const app = express();
const cors = require('cors'); 
require('dotenv').config();
const port = process.env.PORT;

app.use(express.json());

app.use(cors());

const usersRouter = require('./users');
app.use('/api/users', usersRouter);

const todosRouter = require('./todos'); 
app.use('/api/todos', todosRouter);

app.listen(port, () => {
  console.log(`Servern lyssnar på port ${port}`);
});