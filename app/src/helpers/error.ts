
export enum ErrorType {
  QUERY,
  WAGMI,
  UNKNOWN
}

const errorMessage = (error: any, type: ErrorType = ErrorType.UNKNOWN) => {
  if (type === ErrorType.QUERY) {
    return error.response.errors[0].message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return JSON.stringify(error)
}

export default errorMessage
