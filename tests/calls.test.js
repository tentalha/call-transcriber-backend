const request = require('supertest');
const app = require('../server');
const store = require('../models/store');
const { processPendingRecordings, stopWorker } = require('../workers/transcriptionWorker');

process.env.BASIC_AUTH_USER = 'admin';
process.env.BASIC_AUTH_PASS = 'password';

const validAuth = Buffer.from('admin:password').toString('base64');
const invalidAuth = Buffer.from('admin:wrongpass').toString('base64');

beforeEach(() => {
  store.calls = {};
  store.recordings = {};
  store.transcripts = {};
});

afterAll(() => {
  stopWorker();
});

describe('Basic Auth Middleware', () => {
  test('Valid credentials returns 404 for nonexistent call (not 401)', async () => {
    const response = await request(app)
      .get('/calls/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Basic ${validAuth}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Call not found');
  });

  test('Invalid credentials returns 401', async () => {
    const response = await request(app)
      .get('/calls/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Basic ${invalidAuth}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });

  test('Missing credentials returns 401', async () => {
    const response = await request(app)
      .get('/calls/00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Unauthorized');
  });
});

describe('POST /calls with recordingUrl', () => {
  test('POST /calls returns 201 and recordingQueued true', async () => {
    const callData = {
      fromNumber: '+1555123456',
      toNumber: '+1555098765',
      startedAt: '2025-01-01T12:00:00.000Z',
      durationSeconds: 180,
      recordingUrl: 'https://example.com/hello_world.mp3',
      sizeBytes: 123456
    };

    const response = await request(app)
      .post('/calls')
      .set('Authorization', `Basic ${validAuth}`)
      .send(callData);

    expect(response.status).toBe(201);
    expect(response.body.recordingQueued).toBe(true);
    expect(response.body.fromNumber).toBe(callData.fromNumber);
    expect(response.body.toNumber).toBe(callData.toNumber);
    expect(response.body.recordings).toHaveLength(1);
    expect(response.body.recordings[0].transcriptionStatus).toBe('pending');
  });

  test('Recording transcriptionStatus becomes completed after processing', async () => {
    const callData = {
      fromNumber: '+1555123456',
      toNumber: '+1555098765',
      startedAt: '2025-01-01T12:00:00.000Z',
      recordingUrl: 'https://example.com/test_recording.mp3'
    };

    const createResponse = await request(app)
      .post('/calls')
      .set('Authorization', `Basic ${validAuth}`)
      .send(callData);

    const callId = createResponse.body.id;

    await processPendingRecordings();

    const getResponse = await request(app)
      .get(`/calls/${callId}`)
      .set('Authorization', `Basic ${validAuth}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.recordings[0].transcriptionStatus).toBe('completed');
    expect(getResponse.body.recordings[0].transcript).toBeDefined();
    expect(getResponse.body.recordings[0].transcript.text).toBeDefined();
    expect(getResponse.body.recordings[0].transcript.wordCount).toBeGreaterThan(0);
    expect(getResponse.body.recordings[0].transcript.confidence).toBeGreaterThanOrEqual(0.75);
    expect(getResponse.body.recordings[0].transcript.confidence).toBeLessThanOrEqual(0.97);
  });
});