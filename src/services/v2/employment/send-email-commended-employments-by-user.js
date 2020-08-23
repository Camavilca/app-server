import Employment from "../../../models/Empleo";
import User from "../../../models/User";
import Cv from "../../../models/Cv";
import Score from "../../../models/Puntaje";
import EmailService from "../email";
import RemmendationTemplate from "./templates/recommendation-template";
import UserInfoService from "../user-info";

const PERCENTAGE_CRITERIA = 0.7;

async function getUsersWithCV() {
  let usersWithCV = [];
  let cvsUsersIds = await Cv.find();
  cvsUsersIds = cvsUsersIds.map((cv) => ({
    cvId: cv._id.toString(),
    userId: cv.author.toString(),
  }));
  for await (let cvUserIds of cvsUsersIds) {
    let user = await User.findOne({ _id: cvUserIds.userId });
    let userObject = user.toObject();
    userObject.cvId = cvUserIds.cvId;
    // pusheamos un user Object con el campo cvId seteado
    usersWithCV.push(userObject);
  }
  return usersWithCV;
}
async function getEmploymentsWithDictionary() {
  let employmentsWithDictionary = [];
  employmentsWithDictionary = await Employment.find({
    dictionary: { $exists: true },
  });

  return employmentsWithDictionary.map((e) => e.toObject());
}

async function getRecommendedEmploymentByUser() {
  const users = await getUsersWithCV();
  const employments = await getEmploymentsWithDictionary();
  const scores = await Score.find();

  for await (let score of scores) {
    let [user = null] = users.filter(
      (user) => user.cvId === score.cv.toString()
    );
    let [employment = null] = employments.filter(
      (employment) =>
        employment.dictionary.toString() === score.keyword.toString()
    );
    if (!user || !employment || score.puntaje < PERCENTAGE_CRITERIA) {
      continue;
    }
    let [userInfo = null] = await UserInfoService.findUserSelectionInfo({
      author: user._id.toString(),
    });
    let company = await UserInfoService.findOneUserInfo({
      _id: employment.empresa.toString(),
    });
    await EmailService.sendEmail({
      to: user.email,
      subject: "Recomendación de empleo HCP",
      html: RemmendationTemplate({
        fullname: userInfo.nombre + userInfo.paterno,
        employmentName: employment.nombrePuesto || "",
        companyName: company ? company.nombre : "",
      }),
    });
  }
}

export default getRecommendedEmploymentByUser;
