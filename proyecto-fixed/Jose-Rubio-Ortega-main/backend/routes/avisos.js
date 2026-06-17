const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {

    db.query('SELECT * FROM avisos', (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.post('/', (req, res) => {

    const data = req.body;

    const sql = `
    INSERT INTO avisos
    (id,tipo,titulo,descripcion,fecha,grupo,autor,activo)
    VALUES (?,?,?,?,?,?,?,?)
    `;

    db.query(sql, [
        data.id,
        data.tipo,
        data.titulo,
        data.descripcion,
        data.fecha,
        data.grupo,
        data.autor,
        true
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.put('/:id', (req, res) => {

    const data = req.body;

    const sql = `
    UPDATE avisos
    SET tipo=?, titulo=?, descripcion=?, fecha=?, grupo=?, autor=?
    WHERE id=?
    `;

    db.query(sql, [
        data.tipo,
        data.titulo,
        data.descripcion,
        data.fecha,
        data.grupo,
        data.autor,
        req.params.id
    ], (err, result) => {

        if (err) return res.status(500).json(err);
        res.json(result);

    });

});


router.delete('/:id', (req, res) => {

    db.query(
        'DELETE FROM avisos WHERE id=?', [req.params.id],
        (err, result) => {

            if (err) return res.status(500).json(err);
            res.json(result);

        }
    );

});

module.exports = router;