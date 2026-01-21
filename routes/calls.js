const express = require('express');
const router = express.Router();
const { handleCreateCall, handleGetCall } = require('../controllers/callsController');
const basicAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCallRules, getCallRules } = require('../validations/callValidationRules');

router.post('/', basicAuth, createCallRules, validate, handleCreateCall);
router.get('/:callId', basicAuth, getCallRules, validate, handleGetCall);

module.exports = router;