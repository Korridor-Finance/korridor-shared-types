// Remaining KOR-004 definitions still to land: ASETenant, CardAuthRequest,
// CardAuthResponse, AuditEventType.

export type UserRole = "OPERATOR" | "COMPLIANCE" | "ADMIN" | "CUSTOMER" | "ASE" | "SYSTEM";

export type TransactionStatus =
  | "PENDING"
  | "KYC_HOLD"
  | "AML_REVIEW"
  | "GRANT_HOLD"
  | "ROUTING"
  | "SETTLING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

export type JWTTokenType = "access" | "refresh";

// `sub` is a userId for OPERATOR/COMPLIANCE/ADMIN/CUSTOMER, an aseId for ASE,
// or the literal "system" for SYSTEM tokens — those aren't backed by a User row.
export interface JWTPayload {
  sub: string;
  role: UserRole;
  type: JWTTokenType;
}

export type NetworkType = "wifi" | "cellular_4g" | "cellular_5g" | "roaming" | "offline" | "unknown";

export interface DeviceContext {
  deviceId: string;
  os: string;
  model: string;
  appVersion: string;
  gps: { lat: number; lng: number } | null;
  networkType: NetworkType;
}

// KOR-040: every payment rail Korridor integrates with (fiat gateways,
// blockchains, card acquirers, SWIFT) implements PaymentRailAdapter. This is
// the contract every future consumer (EP-07's processPayment, ledger
// reconciliation, etc.) codes against instead of each rail's own webhook
// payload shape.
export type RailName = "PAYPAL" | "MPESA" | "STELLAR" | "BASE" | "CARD_ACQUIRER" | "SWIFT";

export type PaymentDirection = "INBOUND" | "OUTBOUND";

// A rail-agnostic representation of a single payment movement.
export interface PaymentEvent {
  rail: RailName;
  direction: PaymentDirection;
  // The rail's own transaction/reference id — the idempotency key for
  // dedup'ing retried webhooks (KOR-041 in particular: PayPal resends).
  externalRef: string;
  // Integer minor units — cents, kobo, or the rail's smallest indivisible
  // unit. Never a float, to avoid rounding drift across rails.
  amountMinor: number;
  // ISO 4217 for fiat rails; the asset code (e.g. "USDC") for crypto rails.
  currency: string;
  // ISO 8601 — when the rail says the payment happened, not when Korridor
  // received the webhook about it.
  occurredAt: string;
  // The original parsed payload, kept for audit/debugging — never relied
  // on by callers for anything the typed fields above already cover.
  raw: Record<string, unknown>;
}

export interface RefundResult {
  refundId: string;
  status: "SUBMITTED" | "COMPLETED" | "FAILED";
  raw: Record<string, unknown>;
}

// verifySignature() is async across every rail, even ones whose own auth
// scheme is a synchronous HMAC compare: for the blockchain rails (Stellar,
// Base) "verified" means confirmed on-chain with enough confirmations,
// which is inherently an RPC call, and for PayPal it means asking PayPal's
// own verify-webhook-signature endpoint rather than validating a cert
// chain by hand. One async contract across every adapter is simpler than a
// boolean/Promise<boolean> union that differs per rail.
//
// Real call sites always call verifySignature() before parseWebhook() —
// parseWebhook() itself does no verification, so an adapter must never be
// wired to a route that skips the signature check.
//
// parseWebhook() returns null for a well-formed payload the adapter simply
// doesn't care about (e.g. a PayPal event type other than
// payment.capture.completed) and throws for a payload that's malformed
// for an event type it does claim to handle — "ignore" and "broken" are
// different failure modes and callers need to tell them apart.
export interface PaymentRailAdapter {
  readonly rail: RailName;
  verifySignature(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<boolean>;
  parseWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): PaymentEvent | null;
  issueRefund(event: PaymentEvent, amountMinor?: number): Promise<RefundResult>;
}

// EP-06 compliance types. Mirrors the Prisma enums of the same name in
// korridor-api's schema.prisma (string-for-string) — kept here too, not
// imported from Prisma, so korridor-web's Kitu/AML dashboards can render
// them without depending on the API's Prisma client.
export type KycTier = "UNVERIFIED" | "BASIC" | "STANDARD" | "ENHANCED";
export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type ComplianceCheckType = "KYC" | "AML_RULES" | "SANCTIONS" | "GRANT";
export type ComplianceResultStatus = "PASS" | "HOLD" | "FAIL";
export type ComplianceCaseStatus = "PENDING" | "APPROVED" | "REJECTED" | "STR_FILED";

// KOR-053: what the compliance pipeline orchestrator returns. `hold` (not
// just `pass: false`) exists because a HOLD needs a human in the AML queue
// — a FAIL doesn't; recommendedStatus reuses TransactionStatus's existing
// KYC_HOLD/AML_REVIEW/GRANT_HOLD states rather than inventing new ones, so
// a transaction's status is always one of the states already defined above.
export interface ComplianceStageResult {
  checkType: ComplianceCheckType;
  result: ComplianceResultStatus;
  reason: string | null;
}

export interface ComplianceResult {
  pass: boolean;
  hold: boolean;
  reason: string | null;
  recommendedStatus: TransactionStatus;
  // Every stage actually run, in order, up to and including the one that
  // stopped the pipeline (short-circuits on the first non-PASS) — not just
  // the final verdict, so a caller can see exactly where it stopped.
  stages: ComplianceStageResult[];
}
