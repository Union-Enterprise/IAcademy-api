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