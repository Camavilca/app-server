import express from "express";
import User from "../../../models/User";
import UserInfo from "../../../models/UserInfo";
import Empresa from "../../../models/Empresa";
import App from "../../../models/App";
import SubUserInfo from "../../../models/SubUserInfo";
import AdminUserInfo from "../../../models/AdminUserInfo";
import FormacionAcademica from "../../../models/FormacionAcademica";
import UserSelectionInfo from "../../../models/UserSelectionInfo";
import { sessionizeUser, regex } from "../../../util/helpers";
import config from "../../../config";
import crypto from "crypto-js";
import nodemailer from "nodemailer";
import AppClass from "../../../controllers/v1/apps";
import passport from "passport";
import Post from "../../../models/Post";
import { FACEBOOK, GOOGLE } from "../../../loaders/express/passport/socialKey";
import fs from "fs-extra";
import { ELIMINADO, ACTIVO } from "../../../constant/selection/empresa/estados";
import { PRODUCTION } from "./../../../constant";
import DeviceDetector from "device-detector-js";

const userRouter = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: config.emailOwner.email,
    pass: config.emailOwner.emailPassword,
  },
});

function Session(req) {
  const { username, email, password } = req.body;
  const CheckRegister = () => {
    if (!username || !email || !password) {
      return { ok: false, message: "Por favor llene todos los campos" };
    }
  };

  const CheckLogin = () => {
    if (!username || !password) {
      return { ok: false, message: "Por favor llene todos los campos" };
    }
  };

  const CheckPassword = () => {
    if (!regex(password)) {
      return {
        ok: false,
        message:
          "La contraseña debe tener entre 6-30 digitos, almenos un caracter especial, una mayuscula y un numero",
      };
    }
  };

  const CreateCarpet = (author) => {
    fs.ensureDirSync(__basedir + "/files/users/" + author + "/documents");
    fs.ensureDirSync(__basedir + "/files/users/" + author + "/images");
    fs.ensureDirSync(__basedir + "/files/users/" + author + "/tests");
  };

  this.getUser = () => {
    return new Promise(async (resolve, reject) => {
      const { user } = req.session;
      if (!user) return reject({ ok: false, message: "No ha iniciado sesion" });
      const currentUser = await User.findOne({ _id: user.userId });
      // TODO: refactor
      return resolve({
        ok: true,
        user: {
          ...user,
          shouldShowRecommendation: currentUser.shouldShowRecommendation,
        },
      });
    });
  };

  this.updateUser = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        const user = await User.findById(author).populate({ path: "apps" });

        if (password) {
          const checkPassword = CheckPassword();
          if (checkPassword) return reject(checkPassword);
          await user.setPassword(password);
        }

        if (email) user.email = email;
        if (username) user.username = username;
        await user.save();

        const sessionUser = sessionizeUser(user);
        req.session.user = sessionUser;

        return resolve({ ok: true, data: sessionUser });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };

  this.login = () => {
    return new Promise(async (resolve, reject) => {
      const checkLogin = CheckLogin();
      if (checkLogin) return reject(checkLogin);

      try {
        const { user } = await User.authenticate()(username, password);
        if (!user) {
          return reject({
            ok: false,
            message: "El usuario y la contraseña no coinciden",
          });
        }

        let apps = await App.find({ user: user._id });
        for (var i in apps) {
          let app = apps[i];
          if (app.expiracion < Date.now()) {
            await this.deleteApp(app._id);
            this.createExpiryNotification(user._id);
          }
        }

        const foundUser = await User.findById(user._id).populate({
          path: "apps",
        });

        const sessionUser = sessionizeUser(foundUser);
        req.session.user = sessionUser;

        return resolve({ ok: true, user: sessionUser });
      } catch (err) {
        return reject({
          ok: false,
          message: err.message,
        });
      }
    });
  };

  this.createFreeTestNotification = async (uid) => {
    await Post.create({
      user: uid,
      title: "Tienes 3 pruebas gratis",
      body: "Aprovecha!",
      link: "/selection/instrucciones",
    });
  };

  this.createExpiryNotification = async (uid) => {
    try {
      await Post.create({
        user: uid,
        title: "Su cuenta ha expirado",
        body: "Su cuenta ha expirado",
        link: "/user",
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  this.updateApp = (id, expiracion = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const app = await App.findById(id);
        if (!app)
          return reject({
            ok: false,
            message: "No se encuentra la aplicacion",
          });

        if (expiracion) app.expiracion = expiracion;
        await app.save();

        const user = await User.findById(app.user).populate({
          path: "apps",
        });
        let userInfo = await UserInfo.findOne({ author: user._id });

        return resolve({
          ok: true,
          user: {
            ...user._doc,
            empresa: userInfo ? userInfo.nombre : user.username,
          },
        });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.deleteApp = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const app = await App.findById(id);
        const user = await User.findById(app.user).populate({
          path: "apps",
        });
        user.apps = user.apps.filter((e) => e.nombre != app.nombre);
        await user.save();
        await app.remove();
        let userInfo = await UserInfo.findOne({ author: user._id });

        return resolve({
          ok: true,
          user: {
            ...user._doc,
            empresa: userInfo ? userInfo.nombre : user.username,
          },
        });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };

  this.register = async () => {
    return new Promise(async (resolve, reject) => {
      const deviceDetector = new DeviceDetector();
      const checkPassword = CheckPassword();
      const checkRegister = CheckRegister();

      if (checkPassword) return reject(checkPassword);
      if (checkRegister) return reject(checkRegister);

      try {
        const {
          author,
          role,
          permissions,
          apps,
          registerUrl,
          userAgent = null,
        } = req.body;

        const {
          client: clientInfo = null,
          os: osInfo = null,
          device: deviceDetailsInfo = null,
        } = deviceDetector.parse(userAgent);

        const clientObj = {
          typeClient: clientInfo.type,
          name: clientInfo.name,
          version: clientInfo.version,
          engine: clientInfo.engine,
          engineVersion: clientInfo.engineVersion,
        };
        const osObj = {
          name: osInfo.name,
          version: osInfo.version,
          platform: osInfo.platform,
        };
        const deviceDetailsObj = {
          typeDevice: deviceDetailsInfo.type,
          brand: deviceDetailsInfo.brand,
          model: deviceDetailsInfo.model,
        };

        const deviceInfo = {
          client: clientObj,
          os: osObj,
          device: deviceDetailsObj,
        };

        const newUser = new User({ username, email });
        role && (newUser.role = role);
        apps && (newUser.apps = apps);
        author && (newUser.author = author);
        permissions && (newUser.permissions = permissions);
        registerUrl && (newUser.registerUrl = registerUrl);
        newUser.deviceInfo = deviceInfo;
        if (Object.is(role, "SubUser")) {
          const userFather = await User.findOne({ _id: author }).populate(
            "apps"
          );
          newUser.apps = userFather.apps;
        }
        await newUser.setPassword(password);
        await newUser.save();

        this.createFreeTestNotification(newUser._id);

        if (author) {
          CreateCarpet(author);
          return resolve({ ok: true });
        } else {
          const response = await this.login();
          CreateCarpet(response.user.userId);
          return resolve(response);
        }
      } catch (err) {
        return reject({
          ok: false,
          message: "El usuario o email ya estan en uso",
        });
      }
    });
  };
  this.logout = (res) => {
    return new Promise(async (resolve, reject) => {
      const user = req.session.user;
      try {
        if (user) {
          await req.session.destroy();
          await res.clearCookie(config.session.name);
          await req.logout();
          return resolve({ ok: true });
        } else {
          return reject({ ok: false, message: "No existe usuario" });
        }
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.forgotPassword = (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const token = crypto.enc.Base64.stringify(
          crypto.lib.WordArray.random(20)
        );

        const user = await User.findOne({ email });

        if (!user)
          return reject({
            ok: false,
            message: "No existe un usuario con ese correo",
          });

        user.token = token;
        user.tokenTimeout = Date.now() + 3600000;
        await user.save();
        const mailOptions = {
          to: user.email,
          from: config.emailOwner.email,
          subject: "Cambio de Contraseña",
          text:
            "Usted solicitó un cambio de contraseña.\n\n" +
            "A continuación, copie este link en su navegador para completar el proceso.\n\n" +
            "http://" +
            (config.nodeEnv === PRODUCTION
              ? req.headers.host
              : "localhost:3000") +
            "/auth/reset/" +
            encodeURIComponent(token) +
            "\n\n" +
            "Si usted no solicito este cambio, solo ignore el mensaje. Su contraseña no será cambiará.\n",
        };
        await transporter.sendMail(mailOptions);
        return resolve({
          ok: true,
          message: "Se ha enviado un mail a " + user.email,
        });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getUserFromToken = (token) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({
          token: token,
          tokenTimeout: {
            $gt: Date.now(),
          },
        });
        if (!user)
          return reject({
            ok: false,
            message: "El token es invalido",
          });
        return resolve({ ok: true, data: { username: user.username } });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.resetPassword = (token, password) => {
    return new Promise(async (resolve, reject) => {
      try {
        const checkPassword = CheckPassword();
        if (checkPassword) return reject(checkPassword);

        const user = await User.findOne({
          token: token,
          tokenTimeout: {
            $gt: Date.now(),
          },
        });
        if (!user)
          return reject({
            ok: false,
            message: "El token es invalido",
          });

        await user.setPassword(password);
        user.token = "";
        user.tokenTimeout = Date.now();
        await user.save();
        const mailOptions = {
          to: user.email,
          from: config.emailOwner.email,
          subject: "Cambio de Contraseña",
          text:
            "Su contraseña ha sido cambiada en la cuenta con el nombre de usuario: " +
            user.username +
            ". Si usted no ha realizado este cambio, por favor contactarse con HCP.",
        };
        await transporter.sendMail(mailOptions);
        return resolve({
          ok: true,
          message: "Se ha cambiado la contraseña",
        });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getUserInfo = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let userInfo;

        switch (req.session.user.role) {
          case "User":
            userInfo = await UserInfo.findOne({
              author: req.session.user.userId,
            });
            break;
          case "SubUser":
            userInfo = await SubUserInfo.findOne({
              author: req.session.user.userId,
            });
            break;
          case "AdminUser":
            userInfo = await AdminUserInfo.findOne({
              author: req.session.user.userId,
            });
            break;
          case "SelectionUser":
            userInfo = await UserSelectionInfo.findOne({
              author: req.session.user.userId,
            })
              .populate({ path: "empresas" })
              .populate({ path: "estudios" });
            break;
          default:
            userInfo = null;
            break;
        }

        if (!userInfo || userInfo.length < 1)
          return reject({
            ok: false,
            message: "Por favor complete su perfil",
          });

        return resolve({ ok: true, data: userInfo });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.createUserInfo = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userInfo;
        switch (req.session.user.role) {
          case "User":
            userInfo = await UserInfo.create({
              ...data,
              author: req.session.user.userId,
            });
            break;
          case "SubUser":
            userInfo = await SubUserInfo.create({
              ...data,
              author: req.session.user.userId,
            });
            break;
          case "AdminUser":
            userInfo = await AdminUserInfo.create({
              ...data,
              author: req.session.user.userId,
            });
            break;
          case "SelectionUser":
            userInfo = await UserSelectionInfo.create({
              ...data,
              author: req.session.user.userId,
            });
            break;
          default:
            userInfo = null;
            break;
        }
        if (!userInfo)
          return reject({
            ok: false,
            message: "Por favor complete su perfil",
          });
        return resolve({ ok: true, data: userInfo });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.updateUserInfo = (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        switch (req.session.user.role) {
          case "User":
            await UserInfo.updateOne({ author: author }, { $set: data });
            break;
          case "SubUser":
            await SubUserInfo.updateOne({ author: author }, { $set: data });
            break;
          case "AdminUser":
            await AdminUserInfo.updateOne({ author: author }, { $set: data });
            break;
          case "SelectionUser":
            let selectionInfo = await UserSelectionInfo.findOne({
              author: author,
            });
            if (selectionInfo === null) {
              this.createUserInfo(data);
            } else {
              await UserSelectionInfo.updateOne(
                { author: author },
                { $set: data }
              );
              await this.createEmpresa(data, selectionInfo);
              await this.createFormacionAcademica(data, selectionInfo);
            }
            break;
          default:
            break;
        }
        const info = await UserSelectionInfo.find({
          author: author,
        })
          .populate({ path: "empresas" })
          .populate({ path: "estudios" });

        return resolve({ ok: true, data: info });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.createEmpresa = (formData, selectionInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        const author = req.session.user.userId;
        let objEmpresa = {};

        const {
          idExperienciaLaboral,
          nombreEmpresa,
          areaLaboral,
          nivelProfesional,
          nombrePuesto,
          ambito,
          fechaInicio,
          fechaFin,
        } = formData;

        if (idExperienciaLaboral === null) {
          objEmpresa = await Empresa.create({
            nombreEmpresa,
            nombrePuesto,
            ambito,
            areaLaboral,
            fechaInicio,
            fechaFin,
            nivelProfesional,
            author,
            estado: ACTIVO,
          });
          selectionInfo.empresas.push(objEmpresa);
          await selectionInfo.save();
        } else {
          await Empresa.updateOne(
            { _id: idExperienciaLaboral },
            {
              $set: {
                nombreEmpresa,
                nombrePuesto,
                areaLaboral,
                ambito,
                nivelProfesional,
                fechaInicio,
                fechaFin,
              },
            }
          );
        }
        return resolve(true);
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.createFormacionAcademica = (formData, selectionInfo) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (formData && formData.universidad) {
          const author = req.session.user.userId;
          const {
            idFormacionAcademica,
            universidad,
            carrera,
            cicloCursando,
            fechaInicioAcademico,
            fechaFinAcademico,
          } = formData;

          let formacion = null;
          if (idFormacionAcademica === null) {
            formacion = await FormacionAcademica.create({
              author,
              universidad,
              carrera,
              cicloCursando,
              fechaInicio: fechaInicioAcademico,
              fechaFin: fechaFinAcademico,
            });
            selectionInfo.estudios.push(formacion);
            await selectionInfo.save();
          } else {
            await FormacionAcademica.updateOne(
              { author: author, _id: idFormacionAcademica },
              {
                $set: {
                  universidad,
                  carrera,
                  cicloCursando,
                  fechaInicio: fechaInicioAcademico,
                  fechaFin: fechaFinAcademico,
                },
              }
            );
            formacion = await FormacionAcademica.findById({
              _id: idFormacionAcademica,
            });
          }
        }
        return resolve(true);
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.contactUs = (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { correo, nombre, empresa, telefono, message } = formData;
        let mailOptions = {
          to: "relacionesempresariales@hc-planning.com",
          from: correo,
          subject: "Correo de la Pagina Web!",
          text: `El Sr(a). ${nombre} de la empresa ${empresa} con telefono
					   ${telefono} le envio el siguiente mensaje desde la pagina web de HCP.
					   ${message}`,
        };
        await transporter.sendMail(mailOptions);
        return resolve({ ok: true });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  /** CAMBIO DE ESTADO ELIMINADO */
  this.deleteEmpresa = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let info = await UserSelectionInfo.findOne({
          author: req.session.user.userId,
        });
        if (typeof info == "undefined")
          reject({ ok: false, message: "Este dato no existe" });

        for (let i = 0; i < info.empresas.length; i++) {
          if (info.empresas[i] == id) info.empresas.splice(i, 1);
        }
        await info.save();
        await Empresa.updateOne(
          { _id: id },
          {
            $set: {
              estado: ELIMINADO,
            },
          }
        );
        let empresa = await Empresa.findOne({ _id: id });
        return resolve({ ok: true, data: empresa });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getAllEmpresas = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let empresas = await Empresa.find();
        return resolve({ ok: true, data: empresas });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.deleteEstudio = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let info = await UserSelectionInfo.findOne({
          author: req.session.user.userId,
        });
        for (let i = 0; i < info.estudios.length; i++) {
          if (info.estudios[i] == id) info.estudios.splice(i, 1);
        }
        await info.save();
        let empresa = await FormacionAcademica.findOne({ _id: id });
        return resolve({ ok: true, data: empresa });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
  this.getAllEstudios = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let estudios = await FormacionAcademica.find();
        return resolve({ ok: true, data: estudios });
      } catch (err) {
        return reject({ ok: false, message: err.message });
      }
    });
  };
}

//@route -> /api/users
//@type -> GET
//@desc -> Get User
userRouter.get("", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.getUser();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users
//@type -> PUT
//@desc -> Update
//@body -> {username: String?, password: String?, email: String?}
userRouter.put("", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.updateUser();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users
//@type -> DELETE
//@desc -> LogOut User
userRouter.delete("", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.logout(res);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/register
//@type -> POST
//@desc -> Register User
//@body -> { username:String, email:String, password:String, apps:[String]? author:(UserId)?, role:String?, permissions:String? }
userRouter.post("/register", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.register();
    // crear aqui la nueva notificacion para el
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/login
//@type -> POST
//@desc -> Login User
//@body -> {username:String, password:String}
userRouter.post("/login", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.login();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

// @route -> /api/users/google/
// @type -> GET
// @desc -> Login Google
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

//@route -> /api/users/google/callback
// @type -> GET
// @desc -> Callback login Google
userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: GOOGLE.failureRedirect,
  }),
  (req, res) => {
    const sessionUser = sessionizeUser(req.user);
    req.session.user = sessionUser;
    res.redirect(GOOGLE.successRedirect);
  }
);

// @route -> /api/users/facebook/
// @type -> GET
// @desc -> Login Facebook
userRouter.get("/facebook", passport.authenticate("facebook"));

//@route -> /api/users/facebook/callback
// @type -> GET
// @desc -> Callback login Facebook
userRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: FACEBOOK.failureRedirect,
  }),
  (req, res) => {
    const sessionUser = sessionizeUser(req.user);
    req.session.user = sessionUser;
    res.redirect(FACEBOOK.successRedirect);
  }
);

// @route ->/api/users/linkedin/
// @type -> GET
// @desc -> Login Linkedin
userRouter.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_basicprofile", "r_emailaddress"],
  })
);

//@route ->/api/users/linkedin/callback
// @type -> GET
// @desc -> Callback login Linkedin
userRouter.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/login" }),
  function () {
    // res.redirect("/");
  }
);

//@route -> /api/users/app
//@type -> POST
//@desc -> Add Application
//@body -> {app:planId, id: (userId)}
userRouter.post("/app", async (req, res) => {
  try {
    const { app, id } = req.body;
    const objApp = new AppClass(req);

    const response = await objApp.createApp(null, app, id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/app
//@type -> PUT
//@desc -> Update Application
//@body -> {id:(appId), expiracion: Date}
userRouter.put("/app", async (req, res) => {
  try {
    const { expiracion, id } = req.body;
    const session = new Session(req);
    const response = await session.updateApp(id, expiracion);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/app
//@type -> DELETE
//@desc -> Delete Application
//@query -> id:(appId)
userRouter.delete("/app", async (req, res) => {
  try {
    const { id } = req.query;
    const session = new Session(req);
    const response = await session.deleteApp(id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/forgot
//@type -> POST
//@desc -> Create Forgot Password Token && Send Mail
//@body -> {email: String}
userRouter.post("/forgot", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.forgotPassword(req.body.email);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/reset/(token)
//@type -> GET
//@desc -> Reset Password
userRouter.get("/reset/:token", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.getUserFromToken(req.params.token);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/reset/(token)
//@type -> POST
//@desc -> Reset Password
//@body -> {password: String}
userRouter.post("/reset/:token", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.resetPassword(
      req.params.token,
      req.body.password
    );
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/info
//@type -> GET
//@desc -> Get User Info
userRouter.get("/info", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.getUserInfo();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/info
//@type -> POST
//@desc -> Create User Info
//@body -> Schema: {UserInfo} || {SubUserInfo} || {AdminUserInfo} || {SelectionSubUserInfo}
userRouter.post("/info", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.createUserInfo(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/info
//@type -> PUT
//@desc -> Update User Info
//@body -> Schema: {UserInfo} || {SubUserInfo} || {AdminUserInfo} || {SelectionSubUserInfo}
userRouter.put("/info", async (req, res) => {
  try {
    const session = new Session(req);
    await session.updateUserInfo(req.body);
    const response = await session.getUserInfo();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/contact
//@type -> POST
//@desc -> Contact Us, Enviar un Correo a HCP
//@body -> {correo: String, empresa: String, message: String, nombre: String, telefono: String}
userRouter.post("/contact", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.contactUs(req.body);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/empresa
//@type -> DELETE
//@desc -> Delete Empresa
//@query -> id:(empresaId)
userRouter.delete("/empresa", async (req, res) => {
  try {
    const { id } = req.query;
    const session = new Session(req);
    const response = await session.deleteEmpresa(id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/empresas
//@type -> GET
userRouter.get("/empresas", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.getAllEmpresas();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/estudio
//@type -> DELETE
//@desc -> Delete Estudios
//@query -> id:(estudioId)
userRouter.delete("/estudio", async (req, res) => {
  try {
    const { id } = req.query;
    const session = new Session(req);
    const response = await session.deleteEstudio(id);
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/users/estudios
//@type -> GET
userRouter.get("/estudios", async (req, res) => {
  try {
    const session = new Session(req);
    const response = await session.getAllEstudios();
    res.json(response);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

export default userRouter;
