// Placeholder shared types for KOR-001 workspace bootstrap.
// Full definitions land in KOR-004: PaymentEvent, PaymentRailAdapter,
// ComplianceResult, ASETenant, TransactionStatus, DeviceContext,
// CardAuthRequest, CardAuthResponse, AuditEventType, JWTPayload, UserRole.

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
