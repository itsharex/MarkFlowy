import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { aiGenerateTextRequest } from '@/extensions/ai/api'
import {
  AIGenerateTextParams,
  defaultAiProviderModelsMap,
  AIProviders,
  aiProviders,
} from './aiProvidersService'
import { cloneDeep } from 'lodash'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAiChatStore = create<AIStore>()(
  persist(
    (set, get) => ({
      aiProvider: 'openai' as const,
      aiProviderModels: defaultAiProviderModelsMap['openai'],
      aiProviderCurModel: aiProviders.reduce(
        (prev, cur) => {
          return {
            ...prev,
            [cur]: defaultAiProviderModelsMap[cur][0],
          }
        },
        {} as AIStore['aiProviderCurModel'],
      ),
      aiProviderModelsMap: cloneDeep(defaultAiProviderModelsMap),

      chatList: [],

      setChatStatus: (id, status) => {
        set((state) => {
          const curChat = state.chatList.find((history) => history.id === id)
          if (curChat) {
            curChat.status = status
            return { ...state }
          }
          return state
        })
      },

      addChat: (question: string, url: string, apiKey: string) => {
        const curStore = get()
        const { aiProviderCurModel, aiProvider } = curStore
        const chat = curStore.addChatQuestion(question)

        aiGenerateTextRequest({
          sdkProvider: aiProvider,
          url,
          apiKey,
          model: aiProviderCurModel[aiProvider],
          text: question,
        })
          .then((text) => {
            curStore.addChatAnswer(chat.id, text)
          })
          .catch(() => {
            // TODO show error message in interface
            curStore.setChatStatus(chat.id, 'error')
          })

        return chat
      },

      getPostSummary: async (text: string, url: string, apiKey: string) => {
        const { aiProvider, aiProviderCurModel } = get()
        const res = await aiGenerateTextRequest({
          sdkProvider: aiProvider,
          url,
          apiKey,
          model: aiProviderCurModel[aiProvider],
          text,
          config: {
            messages: [
              {
                role: 'system',
                content:
                  'Please summarize the summary of this article and return it in markdown format. Only the answer can be returned.',
              },
              { role: 'user', content: text },
            ],
          },
        })

        return res
      },

      getPostTranslate: async (text: string, url: string, apiKey: string, targetLang: string) => {
        const { aiProvider, aiProviderCurModel } = get()
        const res = await aiGenerateTextRequest({
          sdkProvider: aiProvider,
          url,
          apiKey,
          model: aiProviderCurModel[aiProvider],
          text: text,
          config: {
            messages: [
              {
                role: 'system',
                content: `Please translate this document completely into ${targetLang} and return it in markdown format. Only the answer can be returned.`,
              },
              { role: 'user', content: text },
            ],
          },
        })

        return res
      },

      addChatQuestion: (question: string) => {
        const chat = {
          id: nanoid(),
          question,
          status: 'pending' as const,
        }
        set((state) => {
          return { ...state, chatList: [...state.chatList, chat] }
        })
        return chat
      },

      addChatAnswer: (id: string, answer: string) => {
        set((state) => {
          const curChat = state.chatList.find((history) => history.id === id)
          if (curChat) {
            curChat.answer = answer
            curChat.status = 'done'
            return { ...state }
          }
          return state
        })
      },

      delChat: (id: string) => {
        set((state) => {
          return {
            ...state,
            chatList: state.chatList.filter((history) => history.id !== id),
          }
        })
      },

      setAiProvider: (provider) => {
        const { aiProviderModelsMap } = get()

        set((prev) => {
          return {
            ...prev,
            aiProvider: provider,
            aiProviderModels: aiProviderModelsMap[provider],
            aiProviderCurModel: {
              ...prev.aiProviderCurModel,
              [provider]: aiProviderModelsMap[provider][0],
            },
          }
        })
      },

      setAiProviderCurModel: (model) => {
        const { aiProvider } = get()

        set((prev) => {
          return {
            ...prev,
            aiProviderCurModel: {
              ...prev.aiProviderCurModel,
              [aiProvider]: model,
            },
          }
        })
      },

      setAiProviderModelsMap: (data) => {
        set((prev) => {
          const aiProviderCurModel = { ...prev.aiProviderCurModel }

          for (const provider in data) {
            aiProviderCurModel[provider as AIProviders] = data[provider as AIProviders][0]
          }

          return {
            ...prev,
            aiProviderModels: data[prev.aiProvider],
            aiProviderModelsMap: data,
            aiProviderCurModel: aiProviderCurModel,
          }
        })
      },
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)

type ChatStatus = 'pending' | 'done' | 'error'

export interface AIChatHistory {
  id: string
  question: string
  answer?: string
  status: ChatStatus
}

interface AIStore {
  aiProvider: AIProviders
  aiProviderModels: string[]
  aiProviderModelsMap: Record<AIProviders, string[]>
  aiProviderCurModel: Record<AIProviders, string>
  chatList: AIChatHistory[]
  setChatStatus: (id: string, status: ChatStatus) => void
  addChat: (question: string, url: string, apiKey: string) => AIChatHistory
  getPostSummary: (text: string, url: string, apiKey: string) => Promise<string>
  getPostTranslate: (
    text: string,
    url: string,
    apiKey: string,
    targetLang: string,
  ) => Promise<string>
  addChatQuestion: (question: string) => AIChatHistory
  addChatAnswer: (id: string, answer: string) => void
  delChat: (id: string) => void
  setAiProvider: (provider: AIGenerateTextParams['sdkProvider']) => void
  setAiProviderCurModel: (model: string) => void
  setAiProviderModelsMap: (aiProviderModelsMap: AIStore['aiProviderModelsMap']) => void
}

export default useAiChatStore
