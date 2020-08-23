import mongoose, { Schema } from "mongoose";

/**
 * <--------------------------------------------------------------------->
 * @desc los campos de programa_referencial y fecha_programa_referencial
 * se agregaron para saber de que programa ingresan
 * <--------------------------------------------------------------------->
 */

const UserSelectionInfoSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La informacion de usuario necesita un Autor"],
      unique: true,
    },
    nombre: { type: String },
    paterno: { type: String },
    materno: { type: String },
    sexo: { type: String },
    fecha_nacimiento: { type: Date },
    telefono: { type: Number },
    departamento: { type: String },
    provincia: { type: String },
    distrito: { type: String },
    empresas: [{ type: Schema.Types.ObjectId, ref: "Empresa" }],
    estudios: [{ type: Schema.Types.ObjectId, ref: "FormacionAcademica" }],
    programa_referencial: { type: String },
    pretension_salarial: { type: String },
    fecha_programa_referencial: { type: Date },
    area_laboral: { type: String },
    tipo_documento: { type: String },
    numero_documento: { type: String },
  },
  { timestamps: true }
);

const UserSelectionInfo = mongoose.model(
  "UserSelectionInfo",
  UserSelectionInfoSchema
);
export default UserSelectionInfo;
