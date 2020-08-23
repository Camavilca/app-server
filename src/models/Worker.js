import mongoose, { Schema } from "mongoose";

const WorkerSchema = new Schema(
  {
    planilla: {
      type: Schema.Types.ObjectId,
      ref: "Planilla"
    },
    codigo: {
      type: String,
      required: [
        true,
        "Por favor llene el campo 'Codigo' para todos los trabajadores"
      ]
    },
    genero: {
      type: String,
      uppercase: true,
      minlength: [1, "Por favor solo agregue M o F en el genero"],
      maxlength: [1, "Por favor solo agregue M o F en el genero"],
      required: [
        true,
        "Por favor llene el campo 'Genero' para todos los trabajadores"
      ]
    },
    puesto: {
      type: String,
      required: [
        true,
        "Por favor llene el campo 'Puesto' para todos los trabajadores"
      ]
    },
    sueldoBruto: {
      type: Number,
      required: [
        true,
        "Por favor llene el campo 'Sueldo Bruto' para todos los trabajadores"
      ]
    },
    tipoDoc: String,
    numDoc: String,
    nombre: String,
    correo: String,
    sede: String,
    nivel: String,
    nacimiento: Date,
    ingreso: Date,
    ascenso: Date,
    cargoAnterior: String,
    sueldo2016: Number,
    sueldo2017: Number,
    sueldo2018: Number,
    sueldoNeto: Number,
    comision: Number,
    otros: Number,
    puntos: Number
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", WorkerSchema);
export default Worker;
