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

exports.getSimulado = async (req, res) => {
    try{
        const simulado = new Simulado({id: req.params.id});
        const result = await simulado.getSimulado()
        if (simulado.errors.length>0){
            return res.json(errors);
        }
        return res.json(result);
    }catch (err){
        console.log(err);
        res.status(500).json({message: "Erro ao encontrar simulado"});
    }
};

exports.getProva = async (req, res) => {
    try{
        const {id, index} = req.params;
        const simulado = new Simulado({id: id});
        const result = await simulado.getSimulado()
        if (simulado.errors.length>0){
            return res.json(errors);
        }
        return res.json(result.provas[index]);
    }catch (err){
        console.log(err);
        res.status(500).json({message: "Erro ao encontrar simulado"});
    }
};

exports.getQuestao = async (req, res) => {
    try{
        const {id, index, question} = req.params;
        const simulado = new Simulado({id: id});
        const result = await simulado.getSimulado()
        if (simulado.errors.length>0){
            return res.json(errors);
        }
        const provas = result.provas[index]
        return res.json(provas.questoes[question]);
    }catch (err){
        console.log(err);
        res.status(500).json({message: "Erro ao encontrar simulado"});
    }
};

exports.deleteSimulado = async (req, res) => {
    try{
        const simulado = new Simulado({id: req.params.id});
        const result = await simulado.delSimulado();
        if (simulado.errors.length>0){
            return res.json(errors);
        }
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Erro ao deletar simulado"});
    }
}

exports.deleteProva = async (req, res) => {
    try{
        const simulado = new Simulado({id: req.params.id, index: req.params.index});
        const result = await simulado.delProva();
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Erro ao deletar simulado"});
    }
}

exports.deleteQuestao = async (req, res) => {
    try{
        const simulado = new Simulado({id: req.params.id, index: req.params.index, question: req.params.question});
        const result = await simulado.delQuestao();
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Erro ao deletar simulado"});
    }
}

exports.createProva = async (req, res) => {
    try{
        const simulado = new Simulado({id: req.params.id});
        const result = await simulado.createProva(req.body);
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Erro ao deletar simulado"});
    }
}

exports.createQuestion = async (req, res) => {
    console.log(req.body)
    try{
        const simulado = new Simulado({id: req.params.id, index: req.params.index});
        const result = await simulado.createQuestion(req.body);
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Erro ao criar simulado"});
    }
}

exports.uploadQuestionImage = async (req, res) => {
    try{
        console.log(req.body)
        const simulado = new Simulado({id: req.params.id, index: req.params.index, question: req.params.question});
        const result = await simulado.imageUploadQuestion(req.file.filename);
        return res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Fazer upload de imagem do simulado"});
    }
}