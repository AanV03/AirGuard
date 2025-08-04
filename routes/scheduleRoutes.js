const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const verifyToken = require('../middleware/verifyToken');

router.post('/schedules', verifyToken, scheduleController.createSchedule);
router.get('/schedules', verifyToken, scheduleController.getAllSchedules);
router.delete('/schedules/:id', verifyToken, scheduleController.deleteSchedule);

module.exports = router;
