import {IDebtNumber} from 'core/helpers/karmic-debts';

export interface IKarmicDebts {
    numbers: Record<string, IDebtNumber | null>;
}
