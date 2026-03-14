// GeminiModel is a plain string alias – no import needed
type GeminiModel = string

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface GeminiError {
  error: {
    message: string
    code?: number
  }
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export class GeminiRequestError extends Error {
  status: number
  apiCode?: number

  constructor(message: string, status: number, apiCode?: number) {
    super(message)
    this.name = 'GeminiRequestError'
    this.status = status
    this.apiCode = apiCode
  }
}

export class GeminiAPI {
  private apiKey: string
  private model: GeminiModel

  constructor(apiKey: string, model: GeminiModel) {
    this.apiKey = apiKey
    this.model = model
  }

  private getApiUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
  }

  async generateContent(prompt: string, systemInstruction?: string, imageParts?: { mimeType: string, data: string }[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key is required. Please set it in Settings.')
    }

    try {
      const parts: any[] = [{ text: prompt }]
      if (imageParts) {
        imageParts.forEach(img => {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data.split(',')[1] || img.data
            }
          })
        })
      }

      const requestBody: any = {
        contents: [
          {
            parts
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [
            {
              text: systemInstruction
            }
          ]
        }
      }

      let response: Response | null = null

      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch(this.getApiUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) break

        if (attempt === 0 && (response.status === 502 || response.status === 503 || response.status === 504)) {
          await sleep(700 + Math.floor(Math.random() * 400))
          continue
        }

        let apiCode: number | undefined
        let message = ''

        try {
          const errorData: GeminiError = await response.json()
          apiCode = errorData?.error?.code
          message = errorData?.error?.message || ''
        } catch {
          try {
            message = await response.text()
          } catch {
            message = ''
          }
        }

        throw new GeminiRequestError(message || `API Error: ${response.status}`, response.status, apiCode)
      }

      if (!response) {
        throw new Error('Failed to generate content')
      }

      const data: GeminiResponse = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }

      return data.candidates[0].content.parts[0].text
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to generate content')
    }
  }

  async streamContent(
    prompt: string,
    onChunk: (text: string) => void,
    systemInstruction?: string
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key is required. Please set it in Settings.')
    }

    try {
      const requestBody: any = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [
            {
              text: systemInstruction
            }
          ]
        }
      }

      const streamUrl = this.getApiUrl().replace(':generateContent', ':streamGenerateContent')

      let response: Response | null = null

      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        if (response.ok) break

        if (attempt === 0 && (response.status === 502 || response.status === 503 || response.status === 504)) {
          await sleep(700 + Math.floor(Math.random() * 400))
          continue
        }

        let apiCode: number | undefined
        let message = ''

        try {
          const errorData: GeminiError = await response.json()
          apiCode = errorData?.error?.code
          message = errorData?.error?.message || ''
        } catch {
          try {
            message = await response.text()
          } catch {
            message = ''
          }
        }

        throw new GeminiRequestError(message || `API Error: ${response.status}`, response.status, apiCode)
      }

      if (!response) {
        throw new Error('Failed to stream content')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Failed to get response stream')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') continue

          try {
            const data: GeminiResponse = JSON.parse(line)
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
              onChunk(data.candidates[0].content.parts[0].text)
            }
          } catch {
            // JSON parse error - continue
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to stream content')
    }
  }
}

export const useGemini = (apiKey: string, model: GeminiModel) => {
  return new GeminiAPI(apiKey, model)
}
