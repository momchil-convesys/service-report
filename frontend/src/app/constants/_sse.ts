export enum SSE_EventName {
  DATA_INIT = 'DATA_INIT',
  DATA_APPEND = 'DATA_APPEND',
  DATA_PATCH = 'DATA_PATCH',
  DATA_REPLACE = 'DATA_REPLACE',
  KEEPALIVE = 'KEEPALIVE',
}

export enum SSE_DataUpdateMethod {
  Append = 'append',
  Patch = 'patch',
  Replace = 'replace',
}
