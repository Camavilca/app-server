import express from "express";
import AppClass from "../../../controllers/v1/apps";
import PagoClass from "../../../controllers/v1/pago";
import User from "../../../models/User";

const pagoRouter = express.Router();

// TODO: Create Nubefact Usage

//@route -> /api/pago
//@type -> POST
//@desc -> Create Payment Subscription Equality
//@body -> {plan_id: String, phone_number: Number, first_name: String, last_name: String, address_city: String, address: String, email: String, token_id: String, country_code: String(2)}
pagoRouter.post("", async (req, res) => {
  try {
    let pagoObj = new PagoClass(req);
    let appObj = new AppClass(req);
    if (await AppClass.checkUserApp(req.body.app, req.session.user.userId)) {
      let subscription = await pagoObj.constructSubscription(req.body);
      let response = await appObj.createApp(subscription);
      await pagoObj.sendEmail(response && response);
      res.json(response);
    } else {
      res.json({ ok: false, message: "El usuario ya cuenta con un plan" });
    }
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pago
//@type -> GET
//@desc -> get culqi user
pagoRouter.get("", async (req, res) => {
  try {
    let pagoObj = new PagoClass(req);
    let reponse = await pagoObj.getClientById(req.session.user.culqiUser);
    res.json(reponse);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pago/subscriptions
//@type -> GET
//@desc -> get culqi subscriptions
pagoRouter.get("/subscriptions", async (req, res) => {
  try {
    let pagoObj = new PagoClass(req);
    let reponse = await pagoObj.getSubscriptions(req.session.user.apps);
    res.json(reponse);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pago/subscription/(subscriptionId)
//@type -> DELETE
//@desc -> Delete Subscription
pagoRouter.delete("/subscription/:id", async (req, res) => {
  try {
    let pagoObj = new PagoClass(req);
    let reponse = await pagoObj.deleteSubscription(req.params.id);
    res.json(reponse);
  } catch (err) {
    res.json({ ok: false, message: err.message });
  }
});

//@route -> /api/pago
//@type -> POST
//@desc -> Create Payment Subscription Equality
//TODO: Doc
// //@body -> {}
// pagoRouter.post("", async (req, res) => {
// 	try {
// 		const {
// 			token,
// 			planName,
// 			firstName,
// 			lastName,
// 			email,
// 			price,
// 			date,
// 			ruc,
// 			nombreEmpresa,
// 			direccion,
// 			currency,
// 			dbDate
// 		} = req.body;

// 		let user = await User.findById(req.session.user.userId).populate({
// 			path: "apps"
// 		});

// 		if (
// 			user.apps &&
// 			user.apps.filter(e => e.nombre === "equality").length > 0
// 		) {
// 			res.json({ ok: false, message: "El usuario ya tiene la aplicacion" });
// 		} else {
// 			const response = await axios.post(
// 				"https://api-uat.kushkipagos.com/subscriptions/v1/card",
// 				{
// 					token,
// 					planName,
// 					periodicity: "monthly",
// 					contactDetails: {
// 						firstName,
// 						lastName,
// 						email
// 					},
// 					amount: {
// 						subtotalIva: Math.round(parseFloat(price) * 0.82),
// 						subtotalIva0: 0,
// 						ice: 0,
// 						iva: Math.round(parseFloat(price) * 0.18),
// 						currency
// 					},
// 					startDate: dbDate
// 				},
// 				{
// 					headers: {
// 						"Private-Merchant-Id": KUSHKI_PRIVATE,
// 						"Content-Type": "application/json"
// 					}
// 				}
// 			);

// 			let createdApp = await App.create({
// 				planName,
// 				user: user._id,
// 				nombre: "equality",
// 				subscriptionId: response.data.subscriptionId
// 			});

// 			user.apps
// 				? (user.apps = [...user.apps, createdApp])
// 				: (user.apps = [createdApp]);
// 			await user.save();
// 			const sessionUser = sessionizeUser(user);
// 			req.session.user = sessionUser;

// 			const baseDataFactura = {
// 				operacion: "generar_comprobante",
// 				tipo_de_comprobante: 1,
// 				serie: "F001",
// 				numero: 1,
// 				sunat_transaction: 1,
// 				cliente_tipo_de_documento: 6,
// 				cliente_numero_de_documento: ruc,
// 				cliente_denominacion: nombreEmpresa,
// 				cliente_direccion: direccion,
// 				cliente_email: email,
// 				fecha_de_emision: date,
// 				moneda: 2, //1 => S/, 2 => $
// 				porcentaje_de_igv: 18.0,
// 				total_otros_cargos: 0,
// 				total_gravada: price * 0.82,
// 				total_igv: price * 0.18,
// 				total: price,
// 				percepcion_tipo: 1,
// 				detraccion: false,
// 				enviar_automaticamente_a_la_sunat: true,
// 				enviar_automaticamente_al_cliente: true,
// 				formato_de_pdf: "A4",
// 				items: [
// 					{
// 						unidad_de_medida: "ZZ",
// 						codigo: planName,
// 						descripcion: "SERVICIO DE EQUALITY",
// 						cantidad: 1,
// 						valor_unitario: price * 0.82,
// 						precio_unitario: price,
// 						subtotal: price * 0.82,
// 						tipo_de_igv: 1,
// 						igv: price * 0.18,
// 						total: price,
// 						anticipo_regularizacion: false,
// 						codigo_producto_sunat: "80101500"
// 					}
// 				]
// 			};

// 			let nubefact = await axios.post(
// 				"https://api.nubefact.com/api/v1/ca7b5e07-8119-4c1e-80da-0eac5c4ccace",
// 				baseDataFactura,
// 				{
// 					headers: {
// 						Authorization: "Bearer " + NUBEFACT_TOKEN,
// 						"Content-Type": "application/json",
// 						"Access-Control-Allow-Origin": "*"
// 					}
// 				}
// 			);

// 			res.json({ ok: true, user });
// 		}
// 	} catch (err) {
// 		res.json({ ok: false, message: err.message });
// 	}
// });

export default pagoRouter;
