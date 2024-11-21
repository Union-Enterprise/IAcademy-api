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

    async getReports(sender, type, status) {
      let filter = {};
      
      if (sender) {
          filter.sender = {$regex: sender, $options: "i"};
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

    async totalReports() {
      try {
          const summary = await ReportModel.aggregate([
              {
                  $facet: {
                      totalSuggestions: [
                          { $match: { complaint: "Outro" } },
                          { $count: "count" }
                      ],
                      totalMessages: [
                          { $match: { complaint: { $ne: "Outro" } } },
                          { $count: "count" }
                      ],
                      unsolved: [
                          { $match: { solved: false } },
                          { $count: "count" }
                      ],
                      solved: [
                          { $match: { solved: true } },
                          { $count: "count" }
                      ]
                  }
              },
              {
                  $project: {
                      totalSuggestions: { $arrayElemAt: ["$totalSuggestions.count", 0] },
                      totalMessages: { $arrayElemAt: ["$totalMessages.count", 0] },
                      unsolved: { $arrayElemAt: ["$unsolved.count", 0] },
                      solved: { $arrayElemAt: ["$solved.count", 0] }
                  }
              }
          ]);
  
          return summary[0] || {
              totalSuggestions: 0,
              totalMessages: 0,
              unsolved: 0,
              solved: 0
          };
      } catch (error) {
          console.log("Erro buscando denuncias", error);
          throw error;
      }
    }

    async unsolve() {
      const report = await ReportModel.findOneAndUpdate(
        { _id: this.body.id },
        { $set: { solved: false } },
        { new: true, fields: ["sender", "topic", "complaint", "solved", "message", "createdAt"] }
      );
    
      return report;
    }
  
    async solve(){
      const report = await ReportModel.findOneAndUpdate(
        { _id: this.body.id },
        { $set: { solved: true } },
        { new: true, fields: ["sender", "topic", "complaint", "solved", "message", "createdAt"] }
      );  
      return report;
    }
}

module.exports = {Report, ReportModel};