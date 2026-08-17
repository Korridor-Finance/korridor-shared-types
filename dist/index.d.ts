export type UserRole = "OPERATOR" | "COMPLIANCE" | "ADMIN" | "CUSTOMER" | "ASE" | "SYSTEM";
export type TransactionStatus = "PENDING" | "KYC_HOLD" | "AML_REVIEW" | "GRANT_HOLD" | "ROUTING" | "SETTLING" | "COMPLETED" | "FAILED" | "REVERSED";
export type JWTTokenType = "access" | "refresh";
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
    gps: {
        lat: number;
        lng: number;
    } | null;
    networkType: NetworkType;
}
export type RailName = "PAYPAL" | "MPESA" | "STELLAR" | "BASE" | "CARD_ACQUIRER" | "SWIFT";
export type PaymentDirection = "INBOUND" | "OUTBOUND";
export interface PaymentEvent {
    rail: RailName;
    direction: PaymentDirection;
    externalRef: string;
    amountMinor: number;
    currency: string;
    occurredAt: string;
    raw: Record<string, unknown>;
}
export interface RefundResult {
    refundId: string;
    status: "SUBMITTED" | "COMPLETED" | "FAILED";
    raw: Record<string, unknown>;
}
export interface PaymentRailAdapter {
    readonly rail: RailName;
    verifySignature(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<boolean>;
    parseWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): PaymentEvent | null;
    issueRefund(event: PaymentEvent, amountMinor?: number): Promise<RefundResult>;
}
export type KycTier = "UNVERIFIED" | "BASIC" | "STANDARD" | "ENHANCED";
export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type ComplianceCheckType = "KYC" | "AML_RULES" | "SANCTIONS" | "GRANT";
export type ComplianceResultStatus = "PASS" | "HOLD" | "FAIL";
export type ComplianceCaseStatus = "PENDING" | "APPROVED" | "REJECTED" | "STR_FILED";
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
    stages: ComplianceStageResult[];
}
export type AuditEventType = "PAYMENT_RECEIVED" | "COMPLIANCE_PASS" | "COMPLIANCE_FAIL" | "KYC_CHECK" | "AML_FLAG" | "GRANT_CHECK" | "ILP_ROUTING_START" | "ILP_ROUTING_COMPLETE" | "LOOP_WEBHOOK_SENT" | "SETTLEMENT_CONFIRMED" | "ETIMS_GENERATED" | "ETIMS_FAILED" | "TRANSACTION_COMPLETED" | "TRANSACTION_FAILED" | "CARD_AUTH_APPROVED" | "CARD_AUTH_DECLINED" | "STR_FILED";
export type ActorType = UserRole;
//# sourceMappingURL=index.d.ts.map