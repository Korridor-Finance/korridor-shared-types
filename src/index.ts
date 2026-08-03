// Remaining KOR-004 definitions still to land: PaymentEvent, PaymentRailAdapter,
// ComplianceResult, ASETenant, CardAuthRequest, CardAuthResponse, AuditEventType.

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
