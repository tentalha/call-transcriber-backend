const { v4: uuidv4 } = require('uuid');
const store = require('./store');

function createCall(data) {
    const call = {
        id: uuidv4(),
        externalId: data.externalId || null,
        fromNumber: data.fromNumber,
        toNumber: data.toNumber,
        startedAt: data.startedAt,
        durationSeconds: data.durationSeconds || null,
        createdAt: new Date().toISOString(),
        recordings: []
    };

    store.calls[call.id] = call;
    return call;
}

function getCall(id) {
    return store.calls[id];
}

function getAllCalls() {
    return Object.values(store.calls);
}

module.exports = {
    createCall,
    getCall,
    getAllCalls
};