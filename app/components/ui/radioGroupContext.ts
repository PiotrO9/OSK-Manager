import type { ComputedRef, InjectionKey } from 'vue';

export interface RadioGroupContext {
    name: string;
    modelValue: string | number;
    setValue: (value: string | number) => void;
}

export const RADIO_GROUP_INJECTION_KEY = Symbol('RadioGroup') as InjectionKey<
    ComputedRef<RadioGroupContext>
>;
