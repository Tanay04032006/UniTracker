const express = require('express');

module.exports = function createTransactionsRouter(pool) {
  const router = express.Router();


  // GET /api/transactions
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM transactions ORDER BY txn_date DESC, id DESC');
      res.json(rows);
    } catch (err) {
      console.error('GET /transactions error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });
  // ✅ NEW: /api/transactions/summary
  router.get('/summary', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT category,
               SUM(CASE WHEN type = 'expense' THEN -amount ELSE amount END) AS total
        FROM transactions
        GROUP BY category
      `);
      res.json(rows);
    } catch (err) {
      console.error('GET /transactions/summary error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });


  // GET /api/transactions/:id
  router.get('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('GET /transactions/:id error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // POST /api/transactions
  router.post('/', async (req, res) => {
    try {
      const { user_id = 1, title, amount, type, category, txn_date } = req.body;
      if (!title || typeof amount === 'undefined' || !type) {
        return res.status(400).json({ error: 'title, amount and type are required' });
      }

      const [result] = await pool.query(
        `INSERT INTO transactions (user_id, title, amount, type, category, txn_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, title, amount, type, category || null, txn_date || null]
      );

      const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('POST /transactions error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // PUT /api/transactions/:id
  router.put('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, amount, type, category, txn_date } = req.body;

      const fields = [];
      const values = [];
      if (title !== undefined) { fields.push('title = ?'); values.push(title); }
      if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
      if (type !== undefined) { fields.push('type = ?'); values.push(type); }
      if (category !== undefined) { fields.push('category = ?'); values.push(category); }
      if (txn_date !== undefined) { fields.push('txn_date = ?'); values.push(txn_date); }

      if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

      values.push(id);
      const sql = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
      await pool.query(sql, values);

      const [rows] = await pool.query('SELECT * FROM transactions WHERE id = ?', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      console.error('PUT /transactions/:id error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  // DELETE /api/transactions/:id
  router.delete('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true });
    } catch (err) {
      console.error('DELETE /transactions/:id error:', err);
      res.status(500).json({ error: 'DB error' });
    }
  });

  
  return router;
};
