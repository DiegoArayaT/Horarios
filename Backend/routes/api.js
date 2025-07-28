const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las clases
router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los profesores
router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las salas
router.get('/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener el horario completo (todas las celdas con sus asignaciones)
router.get('/schedule', async (req, res) => {
  const semester = parseInt(req.query.semester, 10) || 1;
  try {
    const query = `
      SELECT sb.day, sb.slot, sb.semester,
             sb.class_id, classes.name AS class_name,
             sb.teacher_id, teachers.name AS teacher_name,
             sb.room_id, rooms.name AS room_name
      FROM schedule_blocks sb
      LEFT JOIN classes ON sb.class_id = classes.id
      LEFT JOIN teachers ON sb.teacher_id = teachers.id
      LEFT JOIN rooms ON sb.room_id = rooms.id
      WHERE sb.semester = $1;
    `;
    const result = await pool.query(query, [semester]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar una celda del horario (asignar clase, profesor o sala)
router.post('/schedule', async (req, res) => {
  const { day, slot, semester, class_id, teacher_id, room_id } = req.body;
  try {
    if (class_id !== undefined) {
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, semester, class_id)
         VALUES($1, $2, $3, $4)
         ON CONFLICT (day, slot, semester) DO UPDATE SET class_id = EXCLUDED.class_id`,
        [day, slot, semester, class_id]
      );
    }
    if (teacher_id !== undefined) {
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, semester, teacher_id)
         VALUES($1, $2, $3, $4)
         ON CONFLICT (day, slot, semester) DO UPDATE SET teacher_id = EXCLUDED.teacher_id`,
        [day, slot, semester, teacher_id]
      );
    }
    if (room_id !== undefined) {
      const conflict = await pool.query(
        `SELECT 1 FROM schedule_blocks
         WHERE day=$1 AND slot=$2 AND room_id=$3 AND semester <> $4`,
        [day, slot, room_id, semester]
      );
      if (conflict.rowCount > 0) {
        return res.status(400).json({ error: 'Sala ocupada en ese horario' });
      }
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, semester, room_id)
         VALUES($1, $2, $3, $4)
         ON CONFLICT (day, slot, semester) DO UPDATE SET room_id = EXCLUDED.room_id`,
        [day, slot, semester, room_id]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
