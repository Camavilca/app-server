import NotificationService from "../../services/v1/Notification.Service";

async function markReportAsRead(req, res) {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.json({
        ok: false,
        message: "Falta id de notificación",
      });
    }

    const notificationService = new NotificationService(req);

    await notificationService.markAsRead(notificationId);
    return res.json({
      ok: true,
      message: "Notificacion marcada como leida satisfactoriamente!",
    });
  } catch (error) {
    return res.json({
      ok: false,
      message: "Ocurrio un error al marcar la notificacion como leida",
    });
  }
}

export default { markReportAsRead };
