<script setup lang="ts">
import { Check, Clock3, X } from 'lucide-vue-next';
import { computed, shallowRef, watch } from 'vue';
import { cn } from '@/lib/utils';
import {
    angleForClockHour,
    angleForClockMinute,
    clockAngleFromPoint,
    clockOptionTransform,
    formatTimePickerValue,
    hourFromClockAngle,
    isTimePickerCandidateAllowed,
    isTimePickerHourSelectable,
    minuteFromClockAngle,
    nearestAllowedMinuteForHour,
    normalizeTimePickerValue,
} from '~/utils/date/timePickerValue';

type ClockPart = 'hour' | 'minute';

defineOptions({
    name: 'UiTimePicker',
});

const props = withDefaults(
    defineProps<{
        modelValue: string;
        id?: string;
        disabled?: boolean;
        label: string;
        invalid?: boolean;
        describedby?: string;
        contextLabel?: string;
        minExclusive?: string;
        maxExclusive?: string;
        triggerClass?: string;
    }>(),
    {
        id: undefined,
        disabled: false,
        invalid: false,
        describedby: undefined,
        contextLabel: undefined,
        minExclusive: undefined,
        maxExclusive: undefined,
        triggerClass: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const isOpen = shallowRef(false);
const activePart = shallowRef<ClockPart>('hour');
const draftHour = shallowRef(8);
const draftMinute = shallowRef(0);
const isDragging = shallowRef(false);

const outerHourOptions = Array.from({ length: 12 }, (_, index) => {
    const value = index === 0 ? 12 : index;

    return {
        value,
        label: String(value).padStart(2, '0'),
        angle: angleForClockHour(value),
        radius: 102,
    };
});

const innerHourOptions = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(
    (value) => ({
        value,
        label: String(value).padStart(2, '0'),
        angle: value === 0 ? 0 : (value - 12) * 30,
        radius: 66,
    }),
);

const minuteOptions = Array.from({ length: 12 }, (_, index) => {
    const value = index * 5;

    return {
        value,
        label: String(value).padStart(2, '0'),
        angle: angleForClockMinute(value),
        radius: 102,
    };
});

const minutePresets = [0, 15, 30, 45];

const bounds = computed(() => ({
    minExclusive: props.minExclusive,
    maxExclusive: props.maxExclusive,
}));

const displayedValue = computed(() =>
    formatTimePickerValue(draftHour.value, draftMinute.value),
);

const isDraftAllowed = computed(() =>
    isTimePickerCandidateAllowed(
        draftHour.value,
        draftMinute.value,
        bounds.value,
    ),
);

const triggerValue = computed(() => {
    const parsed = normalizeTimePickerValue(props.modelValue);

    return formatTimePickerValue(parsed.hour, parsed.minute);
});

const clockAngle = computed(() =>
    activePart.value === 'hour'
        ? angleForClockHour(draftHour.value)
        : angleForClockMinute(draftMinute.value),
);

const handRadius = computed(() => {
    if (activePart.value === 'minute') {
        return 86;
    }

    return draftHour.value === 0 || draftHour.value > 12 ? 52 : 86;
});

const handStyle = computed(() => ({
    height: `${handRadius.value}px`,
    transform: `rotate(${clockAngle.value}deg)`,
}));

const handleDotStyle = computed(() => ({
    transform: clockOptionTransform(clockAngle.value, handRadius.value),
}));

const boundsHint = computed(() => {
    if (isDraftAllowed.value) {
        return '';
    }

    if (props.minExclusive && props.maxExclusive) {
        return `Wybierz godzinę po ${props.minExclusive} i przed ${props.maxExclusive}.`;
    }

    if (props.minExclusive) {
        return `Wybierz godzinę po ${props.minExclusive}.`;
    }

    if (props.maxExclusive) {
        return `Wybierz godzinę przed ${props.maxExclusive}.`;
    }

    return 'Wybierz poprawną godzinę.';
});

const currentClockOptions = computed(() => {
    if (activePart.value === 'minute') {
        return minuteOptions.map((option) => ({
            ...option,
            disabled: !isMinuteSelectable(option.value),
        }));
    }

    return [...outerHourOptions, ...innerHourOptions].map((option) => ({
        ...option,
        disabled: !isHourSelectable(option.value),
    }));
});

function syncDraftFromModel(): void {
    const next = normalizeTimePickerValue(props.modelValue);

    draftHour.value = next.hour;
    draftMinute.value = next.minute;
    activePart.value = 'hour';
}

watch(
    () => props.modelValue,
    () => {
        if (!isOpen.value) {
            syncDraftFromModel();
        }
    },
    { immediate: true },
);

watch(isOpen, (open) => {
    if (open) {
        syncDraftFromModel();
    } else {
        isDragging.value = false;
    }
});

function setHour(value: number): void {
    updateHour(value, true);
}

function updateHour(value: number, shouldSwitchToMinute: boolean): void {
    const minute = nearestAllowedMinuteForHour(
        value,
        draftMinute.value,
        bounds.value,
    );

    if (minute === null) {
        return;
    }

    draftHour.value = value;
    draftMinute.value = minute;

    if (shouldSwitchToMinute) {
        activePart.value = 'minute';
    }
}

function setMinute(value: number): void {
    if (!isMinuteSelectable(value)) {
        return;
    }

    draftMinute.value = value;
}

function isHourSelectable(hour: number): boolean {
    return isTimePickerHourSelectable(hour, bounds.value);
}

function isMinuteSelectable(minute: number): boolean {
    return isTimePickerCandidateAllowed(draftHour.value, minute, bounds.value);
}

function handleNumberInput(event: Event, part: ClockPart): void {
    if (!(event.target instanceof HTMLInputElement)) {
        return;
    }

    const digits = event.target.value.replace(/\D/g, '').slice(0, 2);

    if (digits.length === 0) {
        return;
    }

    const value = Number(digits);

    if (part === 'hour') {
        const hour = Math.min(23, value);
        const minute = nearestAllowedMinuteForHour(
            hour,
            draftMinute.value,
            bounds.value,
        );

        if (minute !== null) {
            draftHour.value = hour;
            draftMinute.value = minute;
        }

        activePart.value = 'hour';
    } else {
        const minute = Math.min(59, value);

        if (isMinuteSelectable(minute)) {
            draftMinute.value = minute;
        }

        activePart.value = 'minute';
    }
}

function handleSegmentKeydown(event: KeyboardEvent, part: ClockPart): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
    }

    event.preventDefault();
    activePart.value = part;

    const direction = event.key === 'ArrowUp' ? 1 : -1;

    if (part === 'hour') {
        const nextHour = (draftHour.value + direction + 24) % 24;
        const minute = nearestAllowedMinuteForHour(
            nextHour,
            draftMinute.value,
            bounds.value,
        );

        if (minute !== null) {
            draftHour.value = nextHour;
            draftMinute.value = minute;
        }
    } else {
        const nextMinute = (draftMinute.value + direction + 60) % 60;

        if (isMinuteSelectable(nextMinute)) {
            draftMinute.value = nextMinute;
        }
    }
}

function updateFromPointer(event: PointerEvent, target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const center = rect.width / 2;
    const angle = clockAngleFromPoint(x, y, center);
    const distance = Math.hypot(x - center, y - center);

    if (activePart.value === 'hour') {
        updateHour(hourFromClockAngle(angle, distance), false);
    } else {
        setMinute(minuteFromClockAngle(angle));
    }
}

function handlePointerDown(event: PointerEvent): void {
    const target = event.currentTarget;

    if (
        !(target instanceof HTMLElement) ||
        (event.target instanceof HTMLElement &&
            event.target.closest('[data-clock-option]'))
    ) {
        return;
    }

    event.preventDefault();
    isDragging.value = true;
    target.setPointerCapture(event.pointerId);
    updateFromPointer(event, target);
}

function handlePointerMove(event: PointerEvent): void {
    if (!isDragging.value || !(event.currentTarget instanceof HTMLElement)) {
        return;
    }

    updateFromPointer(event, event.currentTarget);
}

function handlePointerUp(event: PointerEvent): void {
    if (!isDragging.value || !(event.currentTarget instanceof HTMLElement)) {
        return;
    }

    isDragging.value = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (activePart.value === 'hour') {
        activePart.value = 'minute';
    }
}

function cancel(): void {
    syncDraftFromModel();
    isOpen.value = false;
}

function apply(): void {
    if (!isDraftAllowed.value) {
        return;
    }

    emit('update:modelValue', displayedValue.value);
    isOpen.value = false;
}
</script>

<template>
    <UiPopover v-model:open="isOpen">
        <UiPopoverTrigger as-child>
            <UiButton
                :id="id"
                type="button"
                variant="outline"
                :disabled="disabled"
                :aria-label="label"
                :aria-invalid="invalid ? true : undefined"
                :aria-describedby="describedby"
                :class="
                    cn(
                        'h-9 w-full justify-between rounded-md px-3 font-normal tabular-nums',
                        triggerClass,
                    )
                "
            >
                <span>{{ triggerValue }}</span>
                <Clock3
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                />
            </UiButton>
        </UiPopoverTrigger>

        <UiPopoverContent
            align="center"
            class="time-picker-panel max-h-[min(31rem,var(--reka-popover-content-available-height))] w-[20rem] overflow-y-auto rounded-lg p-0 shadow-lg"
            :collision-padding="12"
            side="right"
            :side-offset="8"
            sticky="always"
        >
            <div class="border-border bg-muted/25 border-b px-4 py-3">
                <p
                    v-if="contextLabel"
                    class="text-muted-foreground text-xs font-semibold"
                >
                    {{ contextLabel }}
                </p>
                <div class="mt-1 flex items-end gap-1 tabular-nums">
                    <button
                        type="button"
                        class="time-picker-display-segment"
                        :data-active="activePart === 'hour'"
                        aria-label="Godzina"
                        @click="activePart = 'hour'"
                    >
                        <input
                            :value="String(draftHour).padStart(2, '0')"
                            inputmode="numeric"
                            maxlength="2"
                            aria-label="Godzina"
                            class="time-picker-display-input"
                            @focus="activePart = 'hour'"
                            @input="handleNumberInput($event, 'hour')"
                            @keydown="handleSegmentKeydown($event, 'hour')"
                        />
                    </button>
                    <span class="text-foreground pb-0.5 text-3xl font-black">
                        :
                    </span>
                    <button
                        type="button"
                        class="time-picker-display-segment"
                        :data-active="activePart === 'minute'"
                        aria-label="Minuty"
                        @click="activePart = 'minute'"
                    >
                        <input
                            :value="String(draftMinute).padStart(2, '0')"
                            inputmode="numeric"
                            maxlength="2"
                            aria-label="Minuty"
                            class="time-picker-display-input"
                            @focus="activePart = 'minute'"
                            @input="handleNumberInput($event, 'minute')"
                            @keydown="handleSegmentKeydown($event, 'minute')"
                        />
                    </button>
                </div>
            </div>

            <div class="px-4 pt-4">
                <div
                    class="time-picker-clock"
                    :data-dragging="isDragging"
                    @pointerdown="handlePointerDown"
                    @pointermove="handlePointerMove"
                    @pointerup="handlePointerUp"
                    @pointercancel="handlePointerUp"
                >
                    <div
                        class="time-picker-hand"
                        :style="handStyle"
                        aria-hidden="true"
                    />
                    <div
                        class="time-picker-handle"
                        :style="handleDotStyle"
                        aria-hidden="true"
                    />
                    <button
                        v-for="option in currentClockOptions"
                        :key="`${activePart}-${option.value}`"
                        type="button"
                        data-clock-option
                        class="time-picker-option"
                        :disabled="option.disabled"
                        :aria-disabled="option.disabled"
                        :data-selected="
                            activePart === 'hour'
                                ? draftHour === option.value
                                : draftMinute === option.value
                        "
                        :style="{
                            transform: clockOptionTransform(
                                option.angle,
                                option.radius,
                            ),
                        }"
                        @click="
                            activePart === 'hour'
                                ? setHour(option.value)
                                : setMinute(option.value)
                        "
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-2 px-4 pt-3">
                <button
                    v-for="preset in minutePresets"
                    :key="preset"
                    type="button"
                    class="time-picker-preset"
                    :disabled="!isMinuteSelectable(preset)"
                    :aria-disabled="!isMinuteSelectable(preset)"
                    :data-selected="draftMinute === preset"
                    @click="
                        activePart = 'minute';
                        setMinute(preset);
                    "
                >
                    {{ String(preset).padStart(2, '0') }}
                </button>
            </div>

            <p
                v-if="boundsHint"
                class="text-destructive px-4 pt-2 text-xs font-medium"
                role="alert"
            >
                {{ boundsHint }}
            </p>

            <div
                class="border-border mt-4 flex items-center justify-end gap-2 border-t p-3"
            >
                <UiButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="font-semibold"
                    @click="cancel"
                >
                    <X class="size-4" aria-hidden="true" />
                    Anuluj
                </UiButton>
                <UiButton
                    type="button"
                    size="sm"
                    class="font-semibold shadow-xs"
                    :disabled="!isDraftAllowed"
                    @click="apply"
                >
                    <Check class="size-4" aria-hidden="true" />
                    Zastosuj
                </UiButton>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>

<style scoped>
.time-picker-panel {
    --time-picker-surface: color-mix(in srgb, var(--muted) 42%, transparent);
}

.time-picker-display-segment {
    border-radius: 0.5rem;
    transition:
        background-color 220ms ease,
        box-shadow 220ms ease,
        color 220ms ease;
}

.time-picker-display-segment[data-active='true'] {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 10px 22px color-mix(in srgb, var(--primary) 26%, transparent);
}

.time-picker-display-input {
    width: 3.4rem;
    border: 0;
    background: transparent;
    padding: 0.25rem 0.45rem;
    color: inherit;
    text-align: center;
    font-size: 1.875rem;
    font-weight: 900;
    line-height: 1;
    outline: none;
}

.time-picker-clock {
    position: relative;
    width: 16rem;
    height: 16rem;
    margin-inline: auto;
    border: 1px solid var(--border);
    border-radius: 999px;
    background:
        radial-gradient(
            circle at center,
            var(--background) 0 18%,
            transparent 18.5%
        ),
        radial-gradient(circle at center, var(--muted) 0 100%);
    touch-action: none;
}

.time-picker-hand {
    position: absolute;
    bottom: 50%;
    left: calc(50% - 1px);
    z-index: 1;
    width: 2px;
    border-radius: 999px;
    background: var(--primary);
    transform-origin: bottom center;
    transition:
        height 210ms ease,
        transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.time-picker-clock[data-dragging='true'] .time-picker-hand {
    transition: height 180ms ease;
}

.time-picker-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    width: 1.1rem;
    height: 1.1rem;
    border: 3px solid var(--background);
    border-radius: 999px;
    background: var(--primary);
    box-shadow: 0 7px 18px color-mix(in srgb, var(--primary) 35%, transparent);
    transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.time-picker-clock[data-dragging='true'] .time-picker-handle {
    transition: none;
}

.time-picker-option {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    cursor: pointer;
    display: inline-flex;
    width: 2.1rem;
    height: 2.1rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: var(--foreground);
    font-size: 0.78rem;
    font-weight: 800;
    line-height: 1;
    transition:
        background-color 210ms ease,
        color 210ms ease,
        box-shadow 210ms ease;
}

.time-picker-option:hover {
    background: var(--background);
    box-shadow: 0 5px 14px rgb(15 23 42 / 0.1);
}

.time-picker-option[data-selected='true'] {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 8px 18px color-mix(in srgb, var(--primary) 28%, transparent);
}

.time-picker-option:disabled {
    cursor: not-allowed;
    color: var(--muted-foreground);
    opacity: 0.38;
}

.time-picker-option:disabled:hover {
    background: transparent;
    box-shadow: none;
}

.time-picker-preset {
    display: inline-flex;
    cursor: pointer;
    height: 2rem;
    min-width: 2.6rem;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--background);
    color: var(--muted-foreground);
    font-size: 0.75rem;
    font-weight: 800;
    transition:
        background-color 210ms ease,
        border-color 210ms ease,
        color 210ms ease;
}

.time-picker-preset:hover,
.time-picker-preset[data-selected='true'] {
    border-color: var(--primary);
    background: var(--accent);
    color: var(--foreground);
}

.time-picker-preset:disabled {
    cursor: not-allowed;
    border-color: var(--border);
    background: transparent;
    color: var(--muted-foreground);
    opacity: 0.45;
}

@media (prefers-reduced-motion: reduce) {
    .time-picker-display-segment,
    .time-picker-hand,
    .time-picker-handle,
    .time-picker-option,
    .time-picker-preset {
        transition: none;
    }
}
</style>
