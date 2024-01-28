const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

router.post('/api/users', controllers.createUser);
router.get('/api/users', controllers.getAllUsers);
router.post('/api/users/:_id/exercises', controllers.addExercise);
router.get('/api/users/:_id/logs', controllers.getUserLogs);

module.exports = router;
