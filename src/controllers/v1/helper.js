import User from "../../models/User";
import Planilla from "../../models/Planilla";
import PagoClass from "./pago";
import axios from "axios";
import config from "../../config";

export default class HelperClass {
  static kwSanitize(text, c = 1) {
    switch (c) {
      case 1:
        return text
          .trim()
          .toLowerCase()
          .replace("ñ", "***special***")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace("***special***", "ñ")
          .replace(/[^a-zA-Zñ,\s]/gi, "")
          .split(",");
      case 2:
        return text
          .trim()
          .toLowerCase()
          .replace("ñ", "***special***")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace("***special***", "ñ")
          .replace(/[^a-zA-Zñ\s]/gi, "");
    }
  }
  static checkCompanySize(req, userId) {
    return (async () => {
      try {
        const user = await User.findById(userId).populate({
          path: "apps",
        });
        const app = user.apps
          ? user.apps.filter((e) => e.nombre === "equality")
          : null;

        if (app) {
          const planilla = await Planilla.findOne({
            author: userId,
          }).sort({ createdAt: -1 });
          if (planilla.workers && planilla.workers.length > 0) {
            return await HelperClass.checkPlan(
              req,
              user,
              planilla.workers.length
            );
          }
          return { ok: false };
        }
        return { ok: false };
      } catch (err) {
        return { ok: false };
      }
    })();
  }

  static checkPlan(req, user, len, add = 50) {
    return (async () => {
      try {
        if (user.apps) {
          const response = await axios.get("https://api.culqi.com/v2/plans", {
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + config.culqiPrivate,
            },
          });

          let planes = response.data.data.filter(
            (e) => e.metadata.app === "equality"
          );

          planes = planes.sort((a, b) => a.amount - b.amount);

          let index = planes.length - 1;

          for (var i in planes) {
            if (i * add < len && len <= i * add + add) {
              index = i;
            }
          }

          const pickedPlan = planes[index];
          const userApp = user.apps.filter((e) => e.nombre === "equality")[0];

          if (userApp.planName !== pickedPlan.name) {
            const pago = new PagoClass(req);
            let response = await pago.planChange(
              userApp._id,
              pickedPlan.id,
              user.culqiUser,
              "equality"
            );
            return response;
          }
          return { ok: false };
        }
        return { ok: false };
      } catch (err) {
        return { ok: false };
      }
    })();
  }
  static mediana(numbers) {
    let mediana = 0;
    let numsLen = numbers.length;

    numbers.sort();

    if (numsLen % 2 === 0)
      mediana = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    else mediana = numbers[(numsLen - 1) / 2];

    return mediana;
  }
  static media(numbers) {
    var total = 0,
      i;
    for (i = 0; i < numbers.length; i += 1) {
      total += numbers[i];
    }
    return Math.round(total / numbers.length);
  }
  static getDistinctField(arr, field) {
    let notRepeated = [];
    let repeated = [];
    arr.forEach((item) => {
      if (!notRepeated.find((cat) => cat[field] === item[field]))
        notRepeated.push(item[field]);
      else repeated.push(item[field]);
    });
    return {
      notRepeated,
      repetidos: repeated,
    };
  }
  static getMin(arr) {
    let min = Number.MAX_SAFE_INTEGER;
    arr.forEach((v) => {
      if (v <= min) {
        min = v;
      }
    });
    return min;
  }
  static getMax(arr) {
    let max = Number.MIN_SAFE_INTEGER;
    arr.forEach((v) => {
      if (v >= max) {
        max = v;
      }
    });
    return max;
  }
  static getMinLimit(arr, criteria = 0) {
    const med = HelperClass.mediana(arr);
    return Math.round(med - criteria * med);
  }
  static getMaxLimit(arr, criteria = 0) {
    const med = HelperClass.mediana(arr);
    return Math.round(med + criteria * med);
  }
}
