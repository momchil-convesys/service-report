export function logMalformedMessage(err: any, message: string) {
  console.warn(
    'WebSocketService | Failed to parse object!\nERROR:\n',
    err,
    '\nRAW DATA:\n',
    message,
  );
}

export function logRetry(retryCount: number, waitSeconds: number, err: any, maxRetryCount: number) {
  let logMessage = `WebSocketService | Trying to reconnect... retryCount: ${retryCount},`;

  if (retryCount >= maxRetryCount) {
    logMessage += ` this was the last retry.`;
  } else {
    logMessage += ` next retry in: ${waitSeconds} seconds.`;
  }

  if (err instanceof Error) {
    logMessage += ` Error: ${err.name}, ${err.message}`;
  } else if (err instanceof CloseEvent) {
    logMessage += ` CloseEvent code: ${err.code}`;
  } else if (err instanceof Event) {
    logMessage += ` Event type: ${err.type}`;
  }

  console.warn(logMessage);
}

export function logCloseEvent(e: CloseEvent) {
  let logMessage = `WebSocketService | CLOSE observer | `;

  if (e.wasClean) {
    logMessage += `Connection closed gracefully.`;
  } else {
    logMessage += `CloseEvent code: ${e.code}, reason: ${e.reason || 'No reason provided'}`;
  }

  console.log(logMessage);
}
