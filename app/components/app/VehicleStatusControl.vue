<script setup lang="ts">
import type { VehicleStatus } from '~/types/vehicles/vehicle';

const props = withDefaults(
    defineProps<{
        id: string;
        status: VehicleStatus;
        disabled?: boolean;
        busy?: boolean;
        ariaLabel: string;
    }>(),
    {
        disabled: false,
        busy: false,
    },
);

const emit = defineEmits<{
    statusChange: [status: VehicleStatus];
}>();

const isActive = computed(() => props.status === 'ACTIVE');
const isDisabled = computed(() => props.disabled || props.busy);
const busyTextId = computed(() => `${props.id}-busy`);

const inactiveLabelClasses = computed(() =>
    isActive.value
        ? 'text-muted-foreground'
        : 'bg-background text-foreground shadow-xs ring-1 ring-border',
);

const activeLabelClasses = computed(() =>
    isActive.value
        ? 'bg-background text-foreground shadow-xs ring-1 ring-border'
        : 'text-muted-foreground',
);

function handleCheckedChange(checked: boolean) {
    if (isDisabled.value) return;

    emit('statusChange', checked ? 'ACTIVE' : 'UNAVAILABLE');
}
</script>

<template>
    <div class="inline-flex min-w-0 flex-col gap-1">
        <div
            class="border-border bg-muted/40 inline-flex w-full min-w-0 items-center gap-2 rounded-xl border p-1 text-xs font-medium"
            :class="isDisabled ? 'opacity-70' : ''"
        >
            <span
                class="min-w-0 rounded-lg px-2 py-1 transition"
                :class="inactiveLabelClasses"
            >
                Nieaktywny
            </span>
            <UiSwitch
                :id="props.id"
                class="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                :model-value="isActive"
                :disabled="isDisabled"
                :aria-label="props.ariaLabel"
                :aria-busy="props.busy"
                :aria-describedby="props.busy ? busyTextId : undefined"
                @update:model-value="handleCheckedChange"
            />
            <span
                class="min-w-0 rounded-lg px-2 py-1 transition"
                :class="activeLabelClasses"
            >
                Aktywny
            </span>
        </div>
        <span
            v-if="props.busy"
            :id="busyTextId"
            class="text-muted-foreground text-xs"
            role="status"
        >
            Zapisywanie...
        </span>
    </div>
</template>
