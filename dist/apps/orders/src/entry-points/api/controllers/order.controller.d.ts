import { Request, Response, NextFunction } from 'express';
export declare class OrderController {
    private orderService;
    constructor();
    createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrderStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map