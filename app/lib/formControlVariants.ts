import { cva } from 'class-variance-authority';

export type FormControlSize = 'default' | 'touch' | 'compact' | 'sm';

/** One source of geometry for fields; action buttons keep their own variants. */
export const formControlVariants = cva(
    'min-w-0 px-3 py-1 leading-5 transition-[color,box-shadow,border-color,background-color] has-[>svg]:px-3',
    {
        variants: {
            controlSize: {
                default: 'h-11 text-base sm:h-10 sm:text-sm',
                touch: 'h-11 text-base sm:text-sm',
                compact: 'h-11 text-base sm:h-9 sm:text-sm',
                sm: 'h-8 text-sm',
            },
        },
        defaultVariants: {
            controlSize: 'default',
        },
    },
);
