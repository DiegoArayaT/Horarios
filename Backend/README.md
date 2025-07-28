# Backend Notes

Este backend usa **Express** y la librería `pg` para conectarse a PostgreSQL (por ejemplo alojado en Railway). El archivo `index.js` crea una instancia de `Pool` usando la variable de entorno `DATABASE_URL` y define un endpoint de prueba `/api/test-db`.

## Estructura de tablas sugerida

- **classes**: `id`, `name`
- **teachers**: `id`, `name`
- **rooms**: `id`, `name`
- **schedules**: `id`, `view_type` (`class`/`teacher`/`room`), `row` (día), `col` (hora), `item_id` (referencia a la clase/profesor/sala), `semester`

Con estas tablas se puede almacenar lo que el usuario coloca en cada celda del horario.

Al asignar una sala se verifica que no esté ocupada en el mismo día y bloque por otro semestre. Si existe conflicto el backend responde con error.

## Ejemplo de endpoints

```js
// Obtener todas las clases
app.get('/api/classes', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM classes');
  res.json(rows);
});

// Guardar celda del horario
app.post('/api/schedule', async (req, res) => {
  const { view_type, row, col, item_id } = req.body;
  await pool.query(
    'INSERT INTO schedules(view_type, row, col, item_id) VALUES($1,$2,$3,$4) ON CONFLICT ...',
    [view_type, row, col, item_id]
  );
  res.sendStatus(200);
});
```

Estos ejemplos muestran cómo se accedería a la base de datos usando consultas SQL con `pg`. También podría usarse un ORM como **Prisma** o **Sequelize** si se prefiere.
