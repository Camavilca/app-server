import mongoose, { Schema } from "mongoose";

const EmpleoScrapySchema = new Schema({
  index: { type: Number },
  fuente: { type: String },
  link: { type: String },
  titulo: { type: String },
  company: { type: String },
  fecha: { type: String },
  salario: { type: String },
  lugar: { type: String },
  descripcion: { type: String },
});

const EmpleoScrapy = mongoose.model(
  "EmpleoScrapy",
  EmpleoScrapySchema,
  "empleos_scrapy"
);
export default EmpleoScrapy;
