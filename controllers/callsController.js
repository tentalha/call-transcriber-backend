const catchAsync = require('../utils/catchAsync');
const { createCall, getCall } = require('../models/Call');
const { createRecording } = require('../models/Recording');

const handleCreateCall = catchAsync(async (req, res) => {
    const { fromNumber, toNumber, startedAt, recordingUrl, externalId, durationSeconds, sizeBytes } = req.body;

    const call = createCall({
        fromNumber,
        toNumber,
        startedAt,
        externalId,
        durationSeconds
    });

    let recordingQueued = false;
    if (recordingUrl) {
        createRecording(call.id, { recordingUrl, sizeBytes });
        recordingQueued = true;
    }

    res.status(201).json({
        id: call.id,
        externalId: call.externalId,
        fromNumber: call.fromNumber,
        toNumber: call.toNumber,
        startedAt: call.startedAt,
        durationSeconds: call.durationSeconds,
        createdAt: call.createdAt,
        recordingQueued,
        recordings: call.recordings
    });
});

const handleGetCall = catchAsync(async (req, res) => {
    const { callId } = req.params;
    const call = getCall(callId);

    if (!call) {
        return res.status(404).json({ error: 'Call not found' });
    }

    res.status(200).json(call);
});

module.exports = {
    handleCreateCall,
    handleGetCall
};