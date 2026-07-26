import { Router } from 'express';
import {
    createSession,
    getSession,
    joinSession,
    startSession,
    getSessionRanking,
    getSessionReport,
    endSession,
} from '../controllers/sessionController.js';
import { finishPlayer } from '../controllers/playerController.js';

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

router.post('/sessions',                   asyncHandler(createSession));
router.get('/sessions/:code',              asyncHandler(getSession));
router.post('/sessions/:code/join',        asyncHandler(joinSession));
router.post('/sessions/:code/start',       asyncHandler(startSession));
router.get('/sessions/:code/ranking',      asyncHandler(getSessionRanking));
router.get('/sessions/:code/report',       asyncHandler(getSessionReport));
router.post('/sessions/:code/end',         asyncHandler(endSession));

router.post('/players/:playerId/finish',   asyncHandler(finishPlayer));

export default router;
