const { v4: uuidv4 } = require('uuid');
const store = require('./store');

function createTranscript(recordingId, data) {
    const transcript = {
        id: uuidv4(),
        recordingId: recordingId,
        text: data.text,
        wordCount: data.wordCount,
        confidence: data.confidence,
        createdAt: new Date().toISOString()
    };

    store.transcripts[transcript.id] = transcript;

    const recording = store.recordings[recordingId];
    if (recording) {
        recording.transcript = transcript;
    }

    return transcript;
}

function getTranscript(id) {
    return store.transcripts[id];
}

module.exports = {
    createTranscript,
    getTranscript
};