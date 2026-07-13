import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-lite';

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Fetches an image from a URL and converts it to base64.
 * @param {string} url - Public image URL
 * @returns {Promise<{ data: string, mimeType: string }>}
 */
async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패: ${response.status}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' ? result.split(',')[1] : '';
      resolve({ data: base64, mimeType: blob.type || 'image/jpeg' });
    };
    reader.onerror = () => reject(new Error('이미지 변환에 실패했어요.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Analyzes an image using Google Gemini 2.5 Flash and returns structured JSON.
 * @param {string} prompt - The analysis prompt
 * @param {string} imageUrl - Public URL of the image to analyze
 * @param {object} _responseSchema - JSON schema (unused, Gemini uses responseMimeType)
 * @returns {Promise<object>} - Parsed JSON response
 */
export async function analyzeImage(prompt, imageUrl, _responseSchema) {
  if (!API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  const { data, mimeType } = await fetchImageAsBase64(imageUrl);

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data, mimeType } },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });
  } catch (err) {
    throw new Error(`Gemini API 오류: ${err?.message || err}`);
  }

  const content = response.text;
  if (!content) {
    throw new Error('AI 응답이 비어있습니다.');
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('AI 응답을 파싱할 수 없어요.');
  }
}