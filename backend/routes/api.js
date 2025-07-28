const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/schedule', async (req, res) => {
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

router.post('/schedule', async (req, res) => {
  const { day, slot, class_id, teacher_id, room_id } = req.body;
  try {
    if (class_id !== undefined) {
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, class_id)
         VALUES($1, $2, $3)
         ON CONFLICT (day, slot) DO UPDATE SET class_id = EXCLUDED.class_id`,
        [day, slot, class_id]
      );
    }
    if (teacher_id !== undefined) {
      await pool.query(
        `INSERT INTO schedule_blocks(day, slot, teacher_id)
         VALUES($1, $2, $3)
         ON CONFLICT (day, slot) DO UPDATE SET teacher_id = EXCLUDED.teacher_id`,
        [day, slot, teacher_id]
      );
    }
    if (room_id !== undefined) {
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

module.exports = router;
