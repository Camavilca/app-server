import PonderationTestService from "./../../../services/v2/ponderation-test";

/**
 * @param {test} @desc nombre del test : Test.tipo
 * @param {area} @desc nombre del area del empleo : Empleo.areaPuesto
 * @param {positionLevel} @desc nombre del nivel del puesto: Empleo.nivelPuesto
 * @param {testLevel} @desc nombre del nivel del test: :  Test.nivel
 */
async function findTestScore(req, res, next) {
  try {
    const {
      test = null,
      area = null,
      positionLevel = null,
      testLevel = null,
    } = req.body;
    const score = await PonderationTestService.findTestScore({
      test,
      area,
      positionLevel,
      testLevel,
    });

    return res.json({
      ok: true,
      data: score,
      message: `test: ${test}, area: ${area}, positionLevel: ${positionLevel}, testLevel: ${testLevel}`,
    });
  } catch (error) {
    console.log("Error:", error);
    next(error);
  }
}

export default findTestScore;
