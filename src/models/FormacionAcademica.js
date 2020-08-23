// FormacionAcademica
import mongoose, { Schema } from "mongoose";

const FormacionAcademicaSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    universidad: {
      type: String,
    },
    carrera: {
      type: String,
    },
    cicloCursando: {
      type: String,
    },
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const FormacionAcademica = mongoose.model(
  "FormacionAcademica",
  FormacionAcademicaSchema
);
export default FormacionAcademica;
