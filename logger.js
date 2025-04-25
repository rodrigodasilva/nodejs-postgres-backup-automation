const getDate = () => {
  return new Date().toISOString();  
}

const logger = {
  log: (message, ...args) => console.log(`[${getDate()}] - ${message}`, ...args),
  error: (message, ...args) => console.log(`[${getDate()}] - ${message}`, ...args)
}

export { logger }