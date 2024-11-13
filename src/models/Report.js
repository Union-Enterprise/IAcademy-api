const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    topic: { type: String, required: true },
    complaint: { type: String, required: true },
    solved: {type: Boolean, default: false},
    message: {type: String, default: ""}
  }, { timestamps: true})

const ReportModel = mongoose.model('Report', ReportSchema);

class Report {
    constructor(body) {
        this.body = body;
        this.report = null;
        this.errors = [];
    }

    async createReport(){
        try {
            this.report = await ReportModel.create(this.body);
            return this.report;
        } catch (err) {
            this.errors.push("Erro na criação de denuncia.");
            return;
        }
    }

    async getReports(sender, comptopic, type, status) {
        let filter = {};
        
        if (sender) {
            filter.name = {$regex: nameRegex, $options: "i"};
          }
        if (comptopic) {
          filter.topic = comptopic;
        }
        if (type) {
          if (type == "Outro"){
            filter.complaint = "Outro";
          } else {
            filter.complaint = { $ne: "Outro" };
          }
        }
        if (status) {
          filter.solved = status === "solved";
        }
        
      
        try {
          const reports = await ReportModel.find(filter)
            .select('sender topic complaint solved message');
          return reports;
        } catch (error) {
          console.log("Erro ao buscar denuncias", error);
          this.errors.push('Erro ao buscar denuncias')
          return;
        }
      }
}

module.exports = {Report, ReportModel};