import EmploymentService from "../../../services/v2/employment";
import DictionaryService from "../../../services/v2/dictionary";
import UserInfoService from "../../../services/v2/user-info";
import UserService from "../../../services/v2/user";
import EmailService from "../../../services/v2/email";
import AnalyticsService from "../../../services/v2/analytics";
import RecommendedEmploymentService from "../../../services/v2/recommend-employment";
import CvService from "../../../services/v2/cv";
import PuntajeService from "../../../services/v2/puntaje";
import ScoreService from "../../../services/v2/score";
import moment from "moment";
import {
  getPostulatedJobs,
  getFavoriteJobs,
  getRecommendedJobsNoInterested,
} from "./clean-jobs";
import { CANTIDATE_UPLOADED_CV } from "../../../constant/selection/empresa/empleos/my-postulation";
import { ACTIVO } from "../../../constant/selection/empresa/empleos/estados";
import employmentRecommendationTemplate from "../../../services/v2/employment/templates/recommendation-template";
import {
  ALL_JOBS,
  TODAY,
  ONE_DAY_BEFORE,
  SEVEN_DAYS_BEFORE,
  FIFTEEN_DAYS_BEFORE,
  THIRTY_DAYS_BEFORE,
} from "../../../constant/selection/employments/findJobs";
import {
  DEFAULT,
  NOT_INTERESTED,
} from "../../../constant/selection/employments/recommended";

function EmploymentController() {
  return Object.freeze({
    create,
    find,
    findAll,
    // findAllScrapy,
    getRecommendedJobs,
    findByCompany,
    findJobsByDate,
    findJobsByDescriptionOrName,
    findEmployment,
    findEmploymentId,
    removeRecommendedJob,
    changeStateEmployment,
  });
}
export default EmploymentController();

async function removeRecommendedJob(req, res, next) {
  try {
    const userId = (req.session.user && req.session.user.userId) || null;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");
    let employment = req.body;
    await RecommendedEmploymentService.updatePreference(
      userId,
      employment._id,
      NOT_INTERESTED
    );
    let dbRecommendedEmployment = await RecommendedEmploymentService.find({
      author: userId,
      employment: employment._id,
    });
    return res.json({ ok: true, data: dbRecommendedEmployment[0] });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  const PERCENTAGE_SEND_MAIL = 0.7;
  try {
    const userId = (req.session.user && req.session.user.userId) || null;
    if (!userId) {
      throw new Error("Por favor inicie sesión nuevamente");
    }

    const profileCompanyInformation = await UserInfoService.findOneUserInfo({
      author: userId,
    });
    if (!profileCompanyInformation) {
      throw new Error("Por favor complete su perfil");
    }

    // En esta parte seria bueno lanzar un evento y que calcule...
    // Esto para que al crear el empleo no se demore tanto...
    const jobFunctionDescription = req.body.jobFunctionDescription || "";
    const bestDictionaryResult = await AnalyticsService.getBestDictionary(
      jobFunctionDescription
    );

    let dictionaryIdChosen = null;
    const {
      dictionaryId = null,
      additionalWords = null,
    } = bestDictionaryResult;
    // Si el dictionaryId no existe, es porque no hay mejor diccionario
    // Entonces tengo que crear uno
    if (!dictionaryId && additionalWords) {
      // CREAR O ACTUALIZAR
      console.log("CREAR O ACTUALIZAR");
      const newDictionary = await DictionaryService.upsert({
        dictionaryId: req.body.dictionary || null,
        name: req.body.nombrePuesto || null,
        country: req.body.country || "Peru",
        province: req.body.departamento || null,
        area: req.body.areaPuesto || null,
        industry: profileCompanyInformation.sector_empresarial || null,
        keywords: additionalWords.map((word) => Object.values(word)),
        type: "AUTOMATIC",
      });

      console.log("newDictionary: ", newDictionary);

      dictionaryIdChosen = newDictionary._id.toString();

      // Si el dictionaryId existe, pero no existe additionalWords
      // Es porque tengo que usar ese diccionario con id dictionaryId
    } else if (dictionaryId && !additionalWords) {
      // RE-USAR
      console.log("RE-USAR");
      dictionaryIdChosen = dictionaryId;
      // Si el dictionaryId existe y existe additionalWords
      // Es porque tengo que duplicar el diccionario y agregarle nueva data
    } else if (dictionaryId && additionalWords) {
      // DUPLICAR
      console.log("DUPLICAR");
      // Este caso no se ha usado hasta el momento...
      const duplicatedDictionary = await DictionaryService.duplicate(
        dictionaryId
      );
      dictionaryIdChosen = duplicatedDictionary._id.toString();
    }

    const matchCvsResult = await AnalyticsService.getCvsScoreByDictionaryId(
      dictionaryIdChosen
    );

    for await (const [cvId, score] of Object.entries(matchCvsResult)) {
      await ScoreService.upsert({
        dictionaryId: dictionaryIdChosen,
        cvId,
        score,
      });
      // Enviar emails para aquellos que tengan un match mayor
      // al PERCENTAGE_SEND_MAIL = 70%
      /*
      if (score > PERCENTAGE_SEND_MAIL) {
        const cv = await CvService.findOne({ _id: cvId });
        let user = await UserService.findOne({ _id: cv.author });
        // let userInfo = await UserInfoService.findOneUserInfo({author: user._id})
        let messageOptions = {
          from: "relacionesempresariales@hc-planning.com",
          to: user.email,
          subject: "Recomendación de empleo HCP",
          html: employmentRecommendationTemplate({
            // fullname: user.,
            employmentName: req.body.nombrePuesto || "",
            companyName: profileCompanyInformation.nombre || "",
          }),
        };
        let isSent = await EmailService.sendEmail(messageOptions);
        if (isSent) {
          console.log(
            "El correo de recomendación de empleo fue enviado satisfactoriamente!"
          );
        }
      }
      */
    }

    const newEmployment = await EmploymentService.upsert({
      ...req.body,
      employmentId: req.body._id || null,
      author: userId,
      companyProfileId: profileCompanyInformation._id,
      dictionary: dictionaryIdChosen,
      stage: CANTIDATE_UPLOADED_CV,
    });
    return res.json({ ok: true, data: newEmployment });
  } catch (error) {
    next(error);
  }
}

async function changeStateEmployment(req, res, next) {
  try {
    const userId = (req.session.user && req.session.user.userId) || null;
    if (!userId) throw new Error("Por favor inicie sesión nuevamente");
    let { stage, idEmployment } = req.body;
    let employment = await EmploymentService.findOne({ _id: idEmployment });
    employment.etapa = stage;
    let newEmployment = await EmploymentService.updateById(employment);
    console.log("newEmployment: ", newEmployment);
    return res.json({ ok: true, data: newEmployment });
  } catch (error) {
    next(error);
  }
}

async function find(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");

    let recommendedJobs = [];
    let postulatedJobs = [];
    let favoriteJobs = [];
    let jsonEmployments = [];

    postulatedJobs = await getPostulatedJobs(userId);
    favoriteJobs = await getFavoriteJobs(userId);
    recommendedJobs = await getRecommendedJobsNoInterested(userId);

    jsonEmployments = await EmploymentService.findPopulateSort({
      _id: { $nin: [...postulatedJobs, ...favoriteJobs, ...recommendedJobs] },
      estado: ACTIVO,
    });

    return res.json({ ok: true, data: jsonEmployments });
  } catch (error) {
    next(error);
  }
}

async function findAll(req, res, next) {
  try {
    // let userId = req.session.user.userId || null;
    // if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");
    const jsonEmployments = await EmploymentService.findPopulateSort({
      estado: ACTIVO,
    });
    const jsonScrapEmployments = await EmploymentService.findPopulateSortScrap();
    let employmentsList = [...jsonEmployments, ...jsonScrapEmployments];
    return res.json({ ok: true, data: employmentsList });
    // return res.json({ ok: true, data: jsonEmployments });
  } catch (error) {
    next(error);
  }
}

// async function findAllScrapy(req, res, next) {
//   try {
//     let jsonScrapEmployments = [];
//     jsonScrapEmployments = await EmploymentService.findPopulateSortScrap();
//     return res.json({ ok: true, data: jsonScrapEmployments });
//   } catch (error) {
//     next(error);
//   }
// }

async function getRecommendedJobs(req, res, next) {
  try {
    let SCORE = 0.7;
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamenete.");
    let cvUser = await CvService.find({ author: userId });
    let scores = await PuntajeService.find({ cv: cvUser });

    let keywords = scores
      .filter((score) => score.puntaje > SCORE)
      .map((score) => score.keyword);

    let postulateEmployments = [];
    let favoriteEmployments = [];
    postulateEmployments = await getPostulatedJobs(userId);
    favoriteEmployments = await getFavoriteJobs(userId);

    let dbRecommendedEmployments = await RecommendedEmploymentService.find({
      author: userId,
    });

    let idsRecommendedEmployments = dbRecommendedEmployments.map(
      (item) => item.employment
    );

    let jsonEmployments = await EmploymentService.findPopulateSort({
      _id: {
        $nin: [
          ...idsRecommendedEmployments,
          ...postulateEmployments,
          ...favoriteEmployments,
        ],
      },
      dictionary: { $in: keywords },
    });

    let recommendsJobs = jsonEmployments.map((item) => {
      return {
        author: userId,
        employment: item._id,
        preference: DEFAULT,
      };
    });

    await RecommendedEmploymentService.createMany(recommendsJobs);

    let jsonRecommendedJobs = await RecommendedEmploymentService.findPopulate({
      employment: { $nin: [...postulateEmployments] },
      author: userId,
      preference: { $ne: NOT_INTERESTED },
    });

    let data = jsonRecommendedJobs.map((item) => item.employment);

    return res.json({ ok: true, data: data });
  } catch (error) {
    next(error);
  }
}

async function findByCompany(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamente.");

    let companyId = req.query.author;

    let empleos = await EmploymentService.find({
      author: companyId ? companyId : userId,
    });

    return res.json({ ok: true, data: empleos });
  } catch (error) {
    next(error);
  }
}

async function findJobsByDescriptionOrName(req, res, next) {
  try {
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamente.");

    let text = req.query.text;

    let postulatedJobs = [];
    let favoriteJobs = [];
    postulatedJobs = await getPostulatedJobs(userId);
    favoriteJobs = await getFavoriteJobs(userId);

    let jsonEmployments = await EmploymentService.findPopulateSort({
      _id: { $nin: [...postulatedJobs, ...favoriteJobs] },
      estado: ACTIVO,
      $or: [
        { nombrePuesto: { $regex: text, $options: "i" } },
        { descripcion: { $regex: text, $options: "i" } },
        { descripcionFunciones: { $regex: text, $options: "i" } },
      ],
    });

    return res.json({ ok: true, data: jsonEmployments });
  } catch (error) {
    next(error);
  }
}

async function findEmployment(req, res, next) {
  try {
    let text = req.query.text;
    let jsonEmployments = await EmploymentService.findPopulateSort({
      estado: ACTIVO,
      $or: [
        { nombrePuesto: { $regex: text, $options: "i" } },
        { descripcion: { $regex: text, $options: "i" } },
        { descripcionFunciones: { $regex: text, $options: "i" } },
      ],
    });
    let jsonEmploymentsScrap = await EmploymentService.findPopulateSortScrap({
      $or: [
        { titulo: { $regex: text, $options: "i" } },
        { text: { $regex: text, $options: "i" } },
      ],
    });
    let employmentList = [...jsonEmployments, ...jsonEmploymentsScrap];
    return res.json({ ok: true, data: employmentList });
  } catch (error) {
    next(error);
  }
}

async function findEmploymentId(req, res, next) {
  try {
    let { idEmpleo } = req.query;
    let jsonEmployments = await EmploymentService.findOne({ _id: idEmpleo });
    // console.log("findEmploymentId -> jsonEmployments", jsonEmployments);
    if (jsonEmployments === null) {
      let jsonScrapEmployments = await EmploymentService.findOneScrap({
        _id: idEmpleo,
      });
      return res.json({ ok: true, data: jsonScrapEmployments });
    } else return res.json({ ok: true, data: jsonEmployments });
  } catch (error) {
    // console.log(error);
    next(error);
  }
}

async function findJobsByDate(req, res, next) {
  try {
    let jsonEmployments = [];
    let userId = req.session.user.userId || null;
    if (!userId) throw new Error("Por favor inicia sesión nuevamente.");
    let dateText = req.query.dateText;

    const startOfTheDay = (f = null) => {
      var start = f === null ? new Date() : new Date(f);
      start.setHours(0, 0, 0, 0);
      return start;
    };

    const endOfTheDay = (f = null) => {
      var end = f === null ? new Date() : new Date(f);
      end.setHours(23, 59, 59, 999);
      return end;
    };

    const subtractDays = (day) => moment(new Date()).subtract(day, "days");

    let postulatedJobs = [];
    let favoriteJobs = [];

    postulatedJobs = await getPostulatedJobs(userId);
    favoriteJobs = await getFavoriteJobs(userId);

    switch (dateText) {
      case ALL_JOBS:
        jsonEmployments = await EmploymentService.findPopulateSort({
          _id: { $nin: [...postulatedJobs, ...favoriteJobs] },
          estado: ACTIVO,
        });
        break;
      case TODAY:
        jsonEmployments = await EmploymentService.findByDate(
          startOfTheDay(),
          endOfTheDay(),
          postulatedJobs,
          favoriteJobs,
          ACTIVO
        );
        break;
      case ONE_DAY_BEFORE:
        jsonEmployments = await EmploymentService.findByDate(
          startOfTheDay(subtractDays(1)),
          endOfTheDay(),
          postulatedJobs,
          favoriteJobs,
          ACTIVO
        );
        break;
      case SEVEN_DAYS_BEFORE:
        jsonEmployments = await EmploymentService.findByDate(
          startOfTheDay(subtractDays(7)),
          endOfTheDay(),
          postulatedJobs,
          favoriteJobs,
          ACTIVO
        );
        break;
      case FIFTEEN_DAYS_BEFORE:
        jsonEmployments = await EmploymentService.findByDate(
          startOfTheDay(subtractDays(15)),
          endOfTheDay(),
          postulatedJobs,
          favoriteJobs,
          ACTIVO
        );
        break;
      case THIRTY_DAYS_BEFORE:
        jsonEmployments = await EmploymentService.findByDate(
          startOfTheDay(subtractDays(30)),
          endOfTheDay(),
          postulatedJobs,
          favoriteJobs,
          ACTIVO
        );
        break;
    }

    await EmploymentService.populateCompany(jsonEmployments);
    return res.json({ ok: true, data: jsonEmployments });
  } catch (error) {
    next(error);
  }
}
