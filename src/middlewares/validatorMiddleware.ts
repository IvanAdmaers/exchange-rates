import { Request, Response, NextFunction } from 'express';

import { APIError } from '../exceptions';
import { isValidDateFormat } from '../utills';

/**
 * This function is a validator middleware
 */
const validatorMiddleware =
  () => (req: Request, res: Response, next: NextFunction) => {
    const reqAmount = req.query.amount;

    if (reqAmount) {
      if (!reqAmount || reqAmount === ' ' || Number.isNaN(reqAmount)) {
        return next(APIError.invalidAmount('Amount is not a number'));
      }

      const amount: number = +req.query.amount!;

      if (amount <= 0 || !Number.isSafeInteger(amount)) {
        return next(APIError.invalidAmount('Amount is incorrect'));
      }
    }

    const { date } = req.params;

    if (date) {
      if (!isValidDateFormat(date)) {
        return next(APIError.invalidDate());
      }
    }

    return next();
  };

export default validatorMiddleware;
