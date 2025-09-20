import { Payment, Refund, PaymentQueryDto, PaymentStatus, PaymentMethod } from '../../domain/dtos/payment.dto';
export declare class PaymentRepository {
    private paymentCollection;
    private refundCollection;
    constructor();
    create(payment: Omit<Payment, '_id'>): Promise<Payment>;
    findById(paymentId: string): Promise<Payment | null>;
    findByOrderId(orderId: string): Promise<Payment | null>;
    findMany(query: PaymentQueryDto): Promise<{
        payments: Payment[];
        total: number;
    }>;
    update(paymentId: string, updateData: Partial<Payment>): Promise<Payment>;
    delete(paymentId: string): Promise<boolean>;
    createRefund(refund: Omit<Refund, '_id'>): Promise<Refund>;
    getStats(customerId?: string): Promise<{
        totalPayments: number;
        totalAmount: number;
        averageAmount: number;
        statusCounts: Record<PaymentStatus, number>;
        methodCounts: Record<PaymentMethod, number>;
    }>;
}
//# sourceMappingURL=payment.repository.d.ts.map