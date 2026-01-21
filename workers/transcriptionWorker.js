const { createTranscript } = require('../models/Transcript');
const { getPendingRecordings, updateRecording } = require('../models/Recording');

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function transcribeRecording(recordingUrl) {
    const hash = hashString(recordingUrl);

    const words = [
        'hello', 'world', 'this', 'is', 'a', 'test', 'transcription',
        'service', 'processing', 'audio', 'file', 'from', 'recording',
        'call', 'conversation', 'voice', 'message', 'automated', 'system'
    ];

    const wordCount = 5 + (hash % 15);
    const selectedWords = [];

    for (let i = 0; i < wordCount; i++) {
        selectedWords.push(words[(hash + i) % words.length]);
    }

    const text = selectedWords.join(' ');
    const confidence = 0.75 + ((hash % 23) / 100);

    return {
        text,
        wordCount: text.split(' ').length,
        confidence: Math.min(confidence, 0.97)
    };
}

async function processPendingRecordings() {
    const pending = getPendingRecordings();

    for (const recording of pending) {
        try {
            updateRecording(recording.id, {
                transcriptionStatus: 'processing',
                attempts: recording.attempts + 1
            });

            const result = transcribeRecording(recording.recordingUrl);

            createTranscript(recording.id, result);
            updateRecording(recording.id, {
                transcriptionStatus: 'completed'
            });
        } catch (error) {
            const updatedRecording = updateRecording(recording.id, {
                transcriptionStatus: recording.attempts >= 2 ? 'failed' : 'pending'
            });
        }
    }
}

let pollingInterval = null;

function startWorker() {
    if (pollingInterval) {
        return;
    }
    pollingInterval = setInterval(processPendingRecordings, 500);
}

function stopWorker() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

module.exports = {
    transcribeRecording,
    processPendingRecordings,
    startWorker,
    stopWorker
};