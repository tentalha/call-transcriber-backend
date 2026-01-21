const { body, param } = require('express-validator');

const createCallRules = [
    body('fromNumber')
        .notEmpty()
        .withMessage('Invalid fromNumber')
        .matches(/^\+.{9,}$/)
        .withMessage('Invalid fromNumber'),

    body('toNumber')
        .notEmpty()
        .withMessage('Invalid toNumber')
        .matches(/^\+.{9,}$/)
        .withMessage('Invalid toNumber'),

    body('startedAt')
        .notEmpty()
        .withMessage('Invalid startedAt (must be ISO 8601 string)')
        .isISO8601()
        .withMessage('Invalid startedAt (must be ISO 8601 string)')
        .custom((value) => {
            const date = new Date(value);
            if (date.toISOString() !== value) {
                throw new Error('Invalid startedAt (must be ISO 8601 string)');
            }
            return true;
        }),

    body('externalId')
        .optional()
        .isString(),

    body('durationSeconds')
        .optional()
        .isInt({ min: 0 }),

    body('recordingUrl')
        .optional()
        .isURL(),

    body('sizeBytes')
        .optional()
        .isInt({ min: 0 })
];

const getCallRules = [
    param('callId')
        .notEmpty()
        .isUUID()
        .withMessage('Invalid call ID')
];

module.exports = {
    createCallRules,
    getCallRules
};
