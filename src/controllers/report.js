const { Report } = require('../models/Report');

exports.sendReport = async (req, res) => {
    try {
        const report = new Report(req.body);
        const newReport = await report.createReport();

        if (report.errors.length > 0) {
            return res.status(400).json(report.errors);
        }

        return res.status(201).json(newReport);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao mandar a denuncia" });
    }
};

exports.getReports = async (req, res) => {
    const report = new Report(); 
    const { sender, type, status } = req.query;

    try {
        const reports = await report.getReports(sender, type, status); // Assuming getReports is a method on the model
        res.status(200).json(reports);
    } catch (error) {
        console.error("Erro na busca:", error);
        res.status(500).json({ message: "Erro", error });
    }
};

exports.totalReports = async (req, res) => {
    const report = new Report();
    
    const total = await report.totalReports();
    return res.status(200).json(total);
}


exports.solveReport = async (req, res) => {
    try{        
        const report = new Report({id: req.body.id});

        const reportSolved = await report.solve();
        
        res.json("Denúncia resolvida.")
    }catch(err){
        console.log(err)
        res.status(404).json("Denúncia não encontrada.")
    }
}

exports.unsolveReport = async (req, res) => {
    try{        
        const report = new Report({id: req.body.id});

        const reportSolved = await report.unsolve();
        
        res.json("Denúncia colocada em análise.")
    }catch(err){
        console.log(err)
        res.status(404).json("Denúncia não encontrada.")
    }
}