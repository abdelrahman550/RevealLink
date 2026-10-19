/**
 * Uniform error type for every backend call.
 * The backend's error middleware always answers with
 * `{ status: "fail" | "error", message, extra? }`.
 */

export interface BackendFieldIssue {
  path: (string | number)[];
  message: string;
}

export interface ApiErrorBody {
  status: "fail" | "error" | number;
  message: string;
  extra?: unknown;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly kind: "fail" | "error" | "network" | "timeout";
  readonly issues: BackendFieldIssue[];

  constructor(params: {
    message: string;
    statusCode?: number;
    kind?: ApiError["kind"];
    issues?: BackendFieldIssue[];
  }) {
    super(params.message);
    this.name = "ApiError";
    this.statusCode = params.statusCode ?? 500;
    this.kind = params.kind ?? "error";
    this.issues = params.issues ?? [];
  }

  /** Zod-compatible map of `field.name` → first message, for form rendering. */
  get fieldErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const issue of this.issues) {
      const key = issue.path.join(".");
      if (key && !(key in map)) map[key] = issue.message;
    }
    return map;
  }
}

/** Normalises `unknown` rejections into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Error) {
    return new ApiError({ message: error.message, kind: "network" });
  }

  return new ApiError({ message: "Something went wrong.", kind: "network" });
}

/** Reads the backend error envelope out of a fetch Response. */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Non-JSON body (proxy HTML, gateway error, ngrok interstitial…).
  }

  const issues =
    Array.isArray(body?.extra) ? (body.extra as BackendFieldIssue[]) : [];

  return new ApiError({
    message: body?.message ?? `Request failed with status ${response.status}.`,
    statusCode: response.status,
    kind: response.status >= 500 ? "error" : "fail",
    issues,
  });
}
