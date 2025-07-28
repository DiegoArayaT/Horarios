require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // requerido en Railway u otros servicios que necesitan SSL
});

// Obtener todas las clases
app.get('/api/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los profesores
app.get('/api/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las salas
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener el horario completo (todas las celdas con sus asignaciones)
app.get('/api/schedule', async (req, res) => {
  try {
    const query = `
      SELECT sb.day, sb.slot, 
             sb.class_id, classes.name AS class_name,
             sb.teacher_id, teachers.name AS teacher_name,
             sb.room_id, rooms.name AS room_name
      FROM schedule_blocks sb
      LEFT JOIN classes ON sb.class_id = classes.id
      LEFT JOIN teachers ON sb.teacher_id = teachers.id
      LEFT JOIN rooms ON sb.room_id = rooms.id;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar una celda del horario (asignar clase, profesor o sala)
// Se espera en el body: { day, slot, class_id?, teacher_id?, room_id? }
app.post('/api/schedule', async (req, res) => {
  const { day, slot, class_id, teacher_id, room_id } = req.body;
  try {
    // Según el campo presente en la petición, actualizamos solo ese campo.
    if (class_id !== undefined) {
      // Inserta o actualiza la clase en la celda indicada
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, class_id) 
         VALUES($1, $2, $3)
         ON CONFLICT (day, slot) DO UPDATE SET class_id = EXCLUDED.class_id`,
        [day, slot, class_id]
      );
    }
    if (teacher_id !== undefined) {
      // Inserta o actualiza el profesor en la celda indicada
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, teacher_id) 
         VALUES($1, $2, $3)
         ON CONFLICT (day, slot) DO UPDATE SET teacher_id = EXCLUDED.teacher_id`,
        [day, slot, teacher_id]
      );
    }
    if (room_id !== undefined) {
      // Inserta o actualiza la sala en la celda indicada
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, room_id) 
         VALUES($1, $2, $3)
         ON CONFLICT (day, slot) DO UPDATE SET room_id = EXCLUDED.room_id`,
        [day, slot, room_id]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (Inicializar servidor)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
});
