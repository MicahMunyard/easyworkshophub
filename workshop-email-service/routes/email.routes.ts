
import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';

const router = Router();

// Auth routes
router.get('/auth/:provider', EmailController.getAuthUrl);
router.get('/auth/:provider/callback', EmailController.handleOAuthCallback);

// Email operations
router.get('/emails', EmailController.fetchEmails);
router.post('/send', EmailController.sendEmail);
router.post('/booking', EmailController.createBookingFromEmail);
router.post('/disconnect', EmailController.disconnectEmail);

export const emailRoutes = router;
