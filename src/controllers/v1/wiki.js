import Wiki from "../../models/Wiki";

export default class WikiClass {
  constructor(req) {
    this.req = req;
  }
}

WikiClass.prototype.getWiki = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let wiki = await Wiki.find({});

      return resolve({ ok: true, data: wiki });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

WikiClass.prototype.createWiki = function (path, html) {
  return new Promise(async (resolve, reject) => {
    try {
      let wiki = await Wiki.create({ path, html });

      return resolve({ ok: true, data: wiki });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

WikiClass.prototype.updateWiki = function (formData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { id, path, html } = formData;
      const wiki = await Wiki.findById(id);
      path && (wiki.path = path);
      html && (wiki.html = html);
      await wiki.save();

      return resolve({ ok: true, data: wiki });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};

WikiClass.prototype.deleteWiki = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      const wiki = await Wiki.findById(id);
      await wiki.remove();

      return resolve({ ok: true, data: wiki });
    } catch (err) {
      return reject({ ok: false, message: err.message });
    }
  });
};
