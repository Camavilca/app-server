import mongoose, { Schema } from "mongoose";

const AppSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Las applicaciones necesitan un usuario"]
    },
    //equality, selection
    nombre: {
      type: String,
      required: [true, "Seleccione una aplicacion"]
    },
    expiracion: {
      type: Date,
      default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    planName: {
      type: String,
      default: "equality_small"
    },
    subscriptionId: {
      type: String,
      required: false
    },
    cardId: {
      type: String,
      required: false
    },
    customerId: {
      type: String,
      required: false
    },
    planId: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

const App = mongoose.model("App", AppSchema);
export default App;
