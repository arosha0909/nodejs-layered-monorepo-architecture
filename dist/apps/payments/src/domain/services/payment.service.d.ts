import { PaymentResponse, PaymentStatus, PaymentMethod, CreatePaymentDto, UpdatePaymentDto, PaymentQueryDto, RefundDto, Refund } from '../dtos/payment.dto';
import { PaymentRepository } from '../../data-access/repositories/payment.repository';
export declare class PaymentService {
    private readonly paymentRepository;
    constructor(paymentRepository: PaymentRepository);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResponse>;
    processPayment(paymentId: string): Promise<PaymentResponse>;
    getPaymentById(paymentId: string): Promise<PaymentResponse>;
    getPayments(query: PaymentQueryDto): Promise<{
        payments: PaymentResponse[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updatePayment(paymentId: string, updateDto: UpdatePaymentDto): Promise<PaymentResponse>;
    cancelPayment(paymentId: string, reason?: string): Promise<PaymentResponse>;
    processRefund(paymentId: string, refundDto: RefundDto): Promise<Refund>;
    getPaymentStats(customerId?: string): Promise<{
        totalPayments: number;
        totalAmount: number;
        averageAmount: number;
        statusCounts: Record<PaymentStatus, number>;
        methodCounts: Record<PaymentMethod, number>;
    }>;
    private simulatePaymentProcessing;
    private simulateRefundProcessing;
    private generateTransactionId;
    private toPaymentResponse;
}
//# sourceMappingURL=payment.service.d.ts.map