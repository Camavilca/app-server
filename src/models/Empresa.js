import mongoose, { Schema } from "mongoose";

const EmpresaSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    nombreEmpresa: {
      type: String,
      required: [true, "Tiene que completar nombre de la empresa"],
    },
    nombrePuesto: {
      type: String,
      required: [true, "Tiene que completar el nombre del puesto"],
    },
    nivelProfesional: {
      type: String,
      required: [true, "Tiene que completar el nivel profesional"],
    },
    ambito: {
      type: String,
      required: [true, "Tiene que completar el ambito laboral"],
    },
    areaLaboral: {
      type: String,
      required: [true, "Tiene que completar el area laboral"],
    },
    fechaInicio: {
      type: Date,
      required: [true, "Tiene que ingresar la fecha de inicio"],
    },
    fechaFin: {
      type: Date,
    },
    estado: {
      type: String,
      required: [true, "Tiene que completar el campo estado"],
    },
  },
  { timestamps: true }
);

const Empresa = mongoose.model("Empresa", EmpresaSchema);
export default Empresa;
