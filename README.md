# Call Transcriber Backend

A simple backend for managing call records and transcribing recordings. Built with Express and stores everything in memory.

## Setup

You'll need Node.js installed. Then run:

```bash
npm install
BASIC_AUTH_USER=admin BASIC_AUTH_PASS=password npm start
```

Run tests with:
```bash
npm test
```

## Environment Variables

Set these before starting the server:
- `BASIC_AUTH_USER` - your username
- `BASIC_AUTH_PASS` - your password  
- `PORT` - optional, defaults to 3000

## How to Use

The API has two endpoints, both need Basic Auth.

**Create a call:**
```bash
curl -u admin:password -X POST http://localhost:3000/calls \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+1555123456",
    "toNumber": "+1555098765",
    "startedAt": "2025-01-01T12:00:00.000Z",
    "recordingUrl": "https://example.com/recording.mp3"
  }'
```

**Get a call:**
```bash
curl -u admin:password http://localhost:3000/calls/{callId}
```

Phone numbers need to start with `+` and have at least 10 characters. Dates should be in ISO 8601 format.

## What It Does

When you create a call with a recording URL, a background worker picks it up and "transcribes" it. The transcription is deterministic - same URL always gives the same result. The worker runs every 500ms and will retry failed jobs up to 3 times.

The transcription is simulated (not real), but the flow works like a real system would.

## Project Structure

```
controllers/      - handle requests
models/          - data models and in-memory storage
middleware/      - auth and validation
validations/     - validation rules
routes/          - API routes
workers/         - background transcription
tests/           - test files
```

## Error Codes

- 400 - bad input
- 401 - wrong credentials  
- 404 - not found
- 500 - server error

All errors return JSON like `{"error": "message"}`
- Basic Auth middleware protecting all endpoints
- In-memory data store using JavaScript Maps
- Deterministic transcription function (same URL always produces same result)
- Background worker polling every 500ms
- Retry logic with max 3 attempts
- Comprehensive test coverage

The code is designed to be simple and readable.