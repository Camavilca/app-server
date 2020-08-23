import express from "express";
import { sessionizePlanilla } from "../../../util/helpers";
import Planilla from "../../../models/Planilla";
import axios from "axios";

const analisisRouter = express.Router();

//@route -> /api/analisis
//@type -> GET
//@desc -> Get Bandas
analisisRouter.get("", async (req, res) => {
  try {
    const url = "http://3.94.194.187:8082/topics/jsontest4";

    const planilla = await Planilla.find({
      author: req.session.user.userId,
    })
      .sort({ createdAt: -1 })
      .populate({ path: "workers" });

    const data = sessionizePlanilla(planilla[0]);
    const response = await axios.post(url, JSON.stringify(data), {
      headers: {
        "Content-Type": "application/vnd.kafka.json.v2+json",
      },
    });
    // res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default analisisRouter;
