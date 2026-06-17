const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {

    db.query('SELECT * FROM calificaciones', (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.post('/', (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO calificaciones
    (id,alumnoId,materia,bim1,bim2,bim3,ciclo)
    VALUES (?,?,?,?,?,?,?)
    `;

    db.query(sql, [
        data.id,
        data.alumnoId,
        data.materia,
        data.bim1,
        data.bim2,
        data.bim3,
        data.ciclo
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.put('/:id', (req, res) => {

    const data = req.body;

    const sql = `
    UPDATE calificaciones
    SET materia=?, bim1=?, bim2=?, bim3=?, ciclo=?
    WHERE id=?
    `;

    db.query(sql, [
        data.materia,
        data.bim1,
        data.bim2,
        data.bim3,
        data.ciclo,
        req.params.id
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM calificaciones WHERE id=?', [req.params.id],
        (err, result) => {

            if (err) return res.status(500).json(err);
            res.json(result);

        }
    );

});

module.exports = router;