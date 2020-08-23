import express from "express";
import WikiClass from "../../../controllers/v1/wiki";

const wikiRouter = express.Router();

//@route -> /api/wiki
//@type -> GET
//@desc -> Get all Wiki's
wikiRouter.get("", async (req, res) => {
  try {
    const wiki = new WikiClass();
    const response = await wiki.getWiki();

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/wiki
//@type -> POST
//@desc -> Crear Wiki
//@body -> {path: String, html: String}
wikiRouter.post("", async (req, res) => {
  try {
    const { path, html } = req.body;
    const wiki = new WikiClass();
    const response = await wiki.createWiki(path, html);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/wiki
//@type -> PUT
//@desc -> Update Wiki
//@body -> {id: WikiId, path: String, html: String}
wikiRouter.put("", async (req, res) => {
  try {
    const wiki = new WikiClass();
    const response = await wiki.updateWiki(req.body);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/wiki
//@type -> DELETE
//@desc -> Delete Wiki
//@query -> id: WikiId
wikiRouter.delete("", async (req, res) => {
  try {
    const wiki = new WikiClass();
    const response = await wiki.deleteWiki(req.query.id);

    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default wikiRouter;
