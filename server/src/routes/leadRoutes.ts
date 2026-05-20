import { Router } from 'express';
import {
	getLeads,
	getLeadById,
	createLead,
	updateLead,
	deleteLead,
	exportLeads,
} from '../controllers/leadController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Export route MUST be defined before /:id route
// (otherwise Express matches "export" as an :id param)
router.get('/export', authorize('admin'), exportLeads);

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
