import EmploymentService from "../../../services/v2/employment";
import schedule from "node-schedule";

function CronService() {
  return Object.freeze({
    sendRecommendedEmploymentsEmail,
  });
}

export default CronService();

function sendRecommendedEmploymentsEmail() {
  // https://www.npmjs.com/package/node-schedule#user-content-cron-style-scheduling
  // schedule.scheduleJob(
  //   "* * 13 * * 1",
  //   EmploymentService.sendEmailCommendedEmploymentsByUser
  // );
}
