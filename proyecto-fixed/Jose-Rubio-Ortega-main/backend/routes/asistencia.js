const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {

    db.query('SELECT * FROM asistencia', (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.post('/', (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO asistencia
    (id,alumnoId,fecha,estado,maestroId)
    VALUES (?,?,?,?,?)
    `;

    db.query(sql, [
        data.id,
        data.alumnoId,
        data.fecha,
        data.estado,
        data.maestroId
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.put('/:id', (req, res) => {

    const data = req.body;

    const sql = `
    UPDATE asistencia
    SET fecha=?, estado=?, maestroId=?
    WHERE id=?
    `;

    db.query(sql, [
        data.fecha,
        data.estado,
        data.maestroId,
        req.params.id
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM asistencia WHERE id=?', [req.params.id],
        (err, result) => {

            if (err) return res.status(500).json(err);
            res.json(result);

        }
    );

});

module.exports = router;