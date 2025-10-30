import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for browser environment (jsdom)
export const server = setupServer(...handlers)
