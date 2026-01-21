const { v4: uuidv4 } = require('uuid');
const store = require('./store');

function createRecording(callId, data) {
    const recording = {
        id: uuidv4(),
        callId: callId,
        recordingUrl: data.recordingUrl,
        sizeBytes: data.sizeBytes || null,
        transcriptionStatus: 'pending',
        attempts: 0,
        createdAt: new Date().toISOString(),
        transcript: null
    };

    store.recordings[recording.id] = recording;

    const call = store.calls[callId];
    if (call) {
        call.recordings.push(recording);
    }

    return recording;
}

function getRecording(id) {
    return store.recordings[id];
}

function getPendingRecordings() {
    return Object.values(store.recordings).filter(
        r => r.transcriptionStatus === 'pending'
    );
}

function updateRecording(id, updates) {
    const recording = store.recordings[id];
    if (recording) {
        Object.assign(recording, updates);
    }
    return recording;
}

module.exports = {
    createRecording,
    getRecording,
    getPendingRecordings,
    updateRecording
};