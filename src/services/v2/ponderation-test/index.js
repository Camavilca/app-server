import connection from "../../../loaders/mongoose";

function PonderationTestService() {
  return Object.freeze({
    findTestScore,
  });
}

export default PonderationTestService();

/**
 * @param {test} @desc nombre del test : Test.tipo
 * @param {area} @desc nombre del area del empleo : Empleo.areaPuesto
 * @param {positionLevel} @desc nombre del nivel del puesto: Empleo.nivelPuesto
 * @param {testLevel} @desc nombre del nivel del test: :  Test.nivel
 */
function findTestScore({ test, area, positionLevel, testLevel }) {
  return new Promise(function (resolve, reject) {
    let score = 0;
    connection({ mongoDriver: true }).then((connection) => {
      const { db, client } = connection;
      const ponderationTestCollection = db.collection("ponderationTest");
      ponderationTestCollection.find({}).toArray(function (err, items) {
        if (err) return reject(err);
        let [document = null] = items.filter((item) => item.name === test);
        if (document == null) {
          return reject(
            new Error("Error: Document ponderationTest not found!")
          );
        }
        let [documentFilterByArea = null] = document.areas.filter(
          (a) => a.name === area
        );
        if (documentFilterByArea == null) {
          return reject(
            new Error("Error: documentFilterByArea ponderationTest not found!")
          );
        }
        let [
          documentFilterByPositionLevel = null,
        ] = documentFilterByArea.nivelPuesto.filter(
          (puesto) => puesto.name === positionLevel
        );
        if (document == null) {
          return reject(
            new Error(
              "Error: documentFilterByPositionLevel ponderationTest not found!"
            )
          );
        }
        [score = null] = documentFilterByPositionLevel.nivelPrueba.filter(
          (nivel) => nivel.name === testLevel
        );
        if (document == null) {
          return reject(new Error("Error: score ponderationTest not found!"));
        }
        client.close();
        resolve(score ? score.value : "No definido");
      });
    });
  });
}
