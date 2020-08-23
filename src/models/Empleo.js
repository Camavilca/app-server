import mongoose, { Schema } from "mongoose";

const EmpleoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Por favor inicie sesion"],
    },
    dictionary: {
      type: Schema.Types.ObjectId,
      ref: "Keyword",
      required: false,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "UserInfo",
      required: [true, "Por favor tiene que completar su perfil"],
    },
    nombrePuesto: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    tiempoExperiencia: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    tipoContrato: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    departamento: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    distrito: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    provincia: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    nivelPuesto: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    areaPuesto: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    tipoSelection: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    numeroVacantes: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    nivelEstudio: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    rangoSalarial: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    areaEstudios: {
      type: Array,
      required: [true, "Por favor llene todos los campos"],
    },
    visualizarSalario: {
      type: Boolean,
      required: [true, "Por favor llene todos los campos"],
    },
    salarioPromedio: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    descripcion: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    descripcionFunciones: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    descripcionBeneficios: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    preguntas: {
      type: Array,
      required: [true, "Por favor llene todos los campos"],
    },
    pruebas: [String],
    conDiscapacidad: {
      type: String,
      required: [false, "Por favor llene todos los campos"],
    },
    fechaExpiracion: {
      type: Date,
      required: [true, "Por favor llene todos los campos"],
    },
    estado: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    etapa: {
      type: String,
      required: [true, "Por favor llene todos los campos"],
    },
    percentageToCalculateCv: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
    percentageToCalculateTest: {
      type: Number,
      required: [true, "Por favor llene todos los campos"],
    },
  },
  { timestamps: true }
);

const Empleo = mongoose.model("Empleo", EmpleoSchema);
export default Empleo;
