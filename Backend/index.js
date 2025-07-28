const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// Monta todas las rutas de /api (todas están en routes/api.js)
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
