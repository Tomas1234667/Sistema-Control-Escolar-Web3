const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    db.query('SELECT * FROM alumnos', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

router.post('/', (req, res) => {
    const data = req.body;

    const sql = `
    INSERT INTO alumnos
    (id,nombre,fechaNac,curp,grupo,tutor,tel,email,sangre,alergias,activo)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `;
    db.query(sql, [
        data.id,
        data.nombre,
        data.fechaNac,
        data.curp,
        data.grupo,
        data.tutor,
        data.tel,
        data.email,
        data.sangre,
        data.alergias,
        true
    ], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const sql = `
    UPDATE alumnos
    SET nombre=?,grupo=?,tel=?,email=?
    WHERE id=?
    `;

    db.query(sql, [
        data.nombre,
        data.grupo,
        data.tel,
        data.email,
        id
    ], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
router.delete('/:id', (req, res) => {
    db.query(
        'DELETE FROM alumnos WHERE id=?', [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

module.exports = router;