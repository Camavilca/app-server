import createReport from "docx-templates";

export default class DocumentService {
  constructor(req) {
    const userId = req.session.user.userId;
    const files = `${__basedir}/files`;
    this.userFiles = `${files}/${userId}`;
  }
}

DocumentService.prototype.createDocument = (data) => {
  return createReport(data);
};
