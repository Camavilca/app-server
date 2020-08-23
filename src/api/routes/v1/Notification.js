import express from "express";
import NotificationController from "../../../controllers/v1/Notification.Controller";

const router = express.Router();

//@route -> /api/notification/mark
//@type -> POST
//@desc -> Mark notification as read
router.post("/mark", NotificationController.markReportAsRead);

export default router;
