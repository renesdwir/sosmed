type ErrorCode = 400 | 401 | 404 | 500;

export function errorHandlerApi(
  code: ErrorCode,
  message?: string,
): [{ error: string }, { status: ErrorCode }] {
  switch (code) {
    case 400:
      return [{ error: "Bad Request" }, { status: code }];
    case 404:
      return [
        { error: `${message ? message + " Not" : "Not"} Found` },
        { status: code },
      ];
    case 401:
      return [{ error: "Unauthorized" }, { status: code }];
    default:
      return [{ error: "Internal Server Error" }, { status: 500 }];
  }
}
