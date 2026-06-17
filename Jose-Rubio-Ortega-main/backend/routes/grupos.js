const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {

    db.query('SELECT * FROM grupos', (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.post('/', (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO grupos
    (id,nombre,grado,salon,maestroId,turno)
    VALUES (?,?,?,?,?,?)
    `;

    db.query(sql, [
        data.id,
        data.nombre,
        data.grado,
        data.salon,
        data.maestroId,
        data.turno
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.put('/:id', (req, res) => {

    const data = req.body;

    const sql = `
    UPDATE grupos
    SET nombre=?, grado=?, salon=?, maestroId=?, turno=?
    WHERE id=?
    `;

    db.query(sql, [
        data.nombre,
        data.grado,
        data.salon,
        data.maestroId,
        data.turno,
        req.params.id
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM grupos WHERE id=?', [req.params.id],
        (err, result) => {

            if (err) return res.status(500).json(err);
            res.json(result);

        }
    );

});

module.exports = router;