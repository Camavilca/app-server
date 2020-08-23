import Charge from "../../models/Cargo";
export default function ChargeService() {
  this.create = async function (data) {
    return Charge.create({
      author: data.userId || null,
      tokenId: data.tokenId || null,
      email: data.email || null,
      testName: data.testName || null,
    });
  };
  this.delete = function () {};
  this.update = function () {};
  this.getAll = function () {};
}
