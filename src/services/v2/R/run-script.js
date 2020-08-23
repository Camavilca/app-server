import R from "r-script";
export default function runScript(data, locationFile) {
  return new Promise((resolve, reject) => {
    try {
      let out = R(locationFile).data(data).callSync();
      resolve(out);
    } catch (error) {
      console.log("Inicio --Este es el error dentro de runScriptR");
      console.log(error);
      console.log("Fin -- Este es el error dentro de runScriptR");
      reject(error);
    }
  });
}
