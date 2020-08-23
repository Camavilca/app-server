import mongoose, { Schema } from "mongoose";

const PostulacionSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "La postulacion necesita un Autor"],
    },
    empleo: {
      type: Schema.Types.ObjectId,
      ref: "Empleo",
      required: [true, "La postulacion necesita un Empleo"],
    },
    estado: { type: String },
    preguntas: { type: Array },
    /** nuevos campos para guardar datos de cv*/
    scoreCv: { type: Number },
    /** nuevos campos para guardar datos de estado tests */
    stateTest: { type: String },
    scoreTest: { type: Number },
    qualificationTest: { type: String },
    /** nuevos campos para guardar datos de estado entrevista */
    stateInterview: { type: String },
    scoreInterview: [
      {
        score: {
          type: Number,
        },
        commentary: {
          type: String,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        nameAuthor: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    qualificationInterview: { type: String },
    /** nuevos campos para guardar datos de estado referencias */
    stateReference: { type: String },
    scoreReference: [
      {
        score: {
          type: Number,
        },
        commentary: {
          type: String,
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        nameAuthor: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    qualificationReference: { type: String },
    /** nuevo campo para guardar el historial del porque le hizo pasar a la siguiente fase */
    stateChanges: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        commentary: {
          type: String,
        },
        score: {
          type: Number,
        },
        state: {
          type: String,
        },
        newState: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    arrIncompleteTests: { type: Array },
    arrCompleteTests: { type: Array },
  },
  { timestamps: true }
);

const Postulacion = mongoose.model("Postulacion", PostulacionSchema);
export default Postulacion;
// etapa: {
//   type: String,
// },
// cv: { type: Schema.Types.ObjectId, ref: "Cv" },
