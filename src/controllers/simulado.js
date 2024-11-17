const { Simulado } = require('../models/Simulado');

exports.createSimulado = async (req, res) => {
    try {
        const simulado = new Simulado(req.body);
        const newSimulado = await simulado.createSimulado();

        if (simulado.errors.length > 0) {
            return res.status(400).json(simulado.errors);
        }

        return res.status(201).json(newSimulado);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao cadastrar o simulado!" });
    }
};

exports.getAllSimulados = async (req, res) => {
    try {
        const simulado = new Simulado(req.body);
        const allSimulados = await simulado.getAllSimulados()
        console.log(allSimulados)

        return res.status(201).json(allSimulados);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao cadastrar o simulado!" });
    }
};