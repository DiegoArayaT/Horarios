const express = require('express');
const cors = require('cors');
const pool = require('./db');

const testRoutes = require('./routes/test');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', testRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log('Backend running on port', PORT));
