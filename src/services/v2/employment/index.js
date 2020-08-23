import mongoose from "mongoose";
import Employment from "../../../models/Empleo";
import EmploymentScrap from "../../../models/EmpleoScrapy";
import { ACTIVO } from "../../../constant/selection/empresa/empleos/estados";
import sendEmailCommendedEmploymentsByUser from "./send-email-commended-employments-by-user";

function EmploymentService() {
  return Object.freeze({
    upsert,
    find,
    findOne,
    findOneScrap,
    findPopulateSort,
    findPopulateSortScrap,
    findByDate,
    populateCompany,
    sendEmailCommendedEmploymentsByUser,
    updateById,
  });
}

export default EmploymentService();

async function upsert(data) {
  var query = { _id: data.employmentId };
  if (!query._id) query._id = new mongoose.mongo.ObjectID();

  const newEmployment = await Employment.findOneAndUpdate(
    query,
    {
      ...data,
      estado: ACTIVO,
      etapa: data.stage,
      empresa: data.companyProfileId,
    },
    {
      new: true,
      upsert: true,
    }
  );
  return newEmployment;
}

async function find({ ...args } = {}) {
  return await Employment.find(args);
}

async function findOne({ ...args } = {}) {
  return await Employment.findOne(args);
}

async function findOneScrap({ ...args } = {}) {
  return await EmploymentScrap.findOne(args);
}

async function findPopulateSort({ ...args } = {}) {
  return await Employment.find(args)
    .sort({ createdAt: -1 })
    .populate({ path: "empresa" });
}

async function findPopulateSortScrap({ ...args } = {}) {
  return await EmploymentScrap.find(args);
  // .sort({ createdAt: -1 })
  // .populate({ path: "empresa" });
}

async function findByDate(
  startDate,
  endDate,
  postulatedJobs,
  favoriteJobs,
  state
) {
  return Employment.find({
    _id: { $nin: [...postulatedJobs, ...favoriteJobs] },
    createdAt: { $gte: startDate, $lt: endDate },
    estado: state,
  });
}

async function populateCompany(empleos) {
  return await Employment.populate(empleos, { path: "empresa" });
}

async function updateById(employment) {
  let newEmployment = null;
  newEmployment = await Employment.updateOne(
    { _id: employment._id },
    employment
  );
  return newEmployment;
}
