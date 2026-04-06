let logs: string[] = []

export function addLog(message: string) {

  const time = new Date().toLocaleTimeString()

  logs.unshift(`${time} - ${message}`)

  if (logs.length > 100) {
    logs.pop()
  }

}

export function getLogs() {
  return logs
}