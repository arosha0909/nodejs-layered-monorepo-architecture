import { Request, Response, NextFunction } from 'express';
export declare class PaymentController {
    private paymentService;
    constructor();
    createPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    processPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPayments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelPayment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    processRefund: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPaymentStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=payment.controller.d.ts.map