const { transcribeRecording, stopWorker } = require('../workers/transcriptionWorker');

afterAll(() => {
  stopWorker();
});

describe('Determinism for transcribeRecording', () => {
  test('Given the same URL twice, returned text and confidence are identical', () => {
    const testUrl = 'https://example.com/same_recording.mp3';

    const result1 = transcribeRecording(testUrl);
    const result2 = transcribeRecording(testUrl);

    expect(result1.text).toBe(result2.text);
    expect(result1.confidence).toBe(result2.confidence);
    expect(result1.wordCount).toBe(result2.wordCount);
  });

  test('Confidence is between 0.75 and 0.97', () => {
    const testUrls = [
      'https://example.com/test1.mp3',
      'https://example.com/test2.mp3',
      'https://example.com/test3.mp3',
      'https://example.com/different_url.mp3',
      'https://example.com/another_test.mp3'
    ];

    testUrls.forEach(url => {
      const result = transcribeRecording(url);
      expect(result.confidence).toBeGreaterThanOrEqual(0.75);
      expect(result.confidence).toBeLessThanOrEqual(0.97);
    });
  });

  test('Different URLs produce different results', () => {
    const url1 = 'https://example.com/recording1.mp3';
    const url2 = 'https://example.com/recording2.mp3';

    const result1 = transcribeRecording(url1);
    const result2 = transcribeRecording(url2);

    expect(result1.text).not.toBe(result2.text);
  });
});