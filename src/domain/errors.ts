export type DomainErrorKind = "not-found" | "rate-limited" | "timeout" | "upstream" | "invalid-data";

export interface DomainError {
  readonly kind: DomainErrorKind;
  readonly message: string;
  readonly status?: number;
}

export const domainError = (kind: DomainErrorKind, message: string, status?: number): DomainError =>
  status === undefined ? { kind, message } : { kind, message, status };
