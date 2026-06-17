const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {
    db.query('SELECT * FROM maestros', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


router.post('/', (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO maestros
    (id,nombre,email,tel,activo)
    VALUES (?,?,?,?,?)
    `;

    db.query(sql, [
        data.id,
        data.nombre,
        data.email,
        data.tel,
        true
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.put('/:id', (req, res) => {

    const data = req.body;

    const sql = `
    UPDATE maestros
    SET nombre=?, email=?, tel=?
    WHERE id=?
    `;

    db.query(sql, [
        data.nombre,
        data.email,
        data.tel,
        req.params.id
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM maestros WHERE id=?', [req.params.id],
        (err, result) => {

            if (err) return res.status(500).json(err);
            res.json(result);

        }
    );

});

module.exports = router;