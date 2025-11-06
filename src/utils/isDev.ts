const isDev = (typeof globalThis !== 'undefined' && globalThis.process?.env?.NODE_ENV === 'development') || globalThis.process?.env?.NODE_ENV === 'test'

export default isDev
