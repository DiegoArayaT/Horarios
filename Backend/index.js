const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: 'Hola desde Express!' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
