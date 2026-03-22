<script setup lang="ts">
import useEmblaSlider from 'embla-carousel-vue';
import type { EmblaOptionsType, EmblaPluginType } from 'embla-carousel';

type SliderVariant = 'default' | 'compact';

interface Props {
    options?: EmblaOptionsType;
    plugins?: EmblaPluginType[];
    showArrows?: boolean;
    showDots?: boolean;
    variant?: SliderVariant;
    ariaLabel?: string;
    slideClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    options: () => ({}),
    plugins: () => [],
    showArrows: true,
    showDots: false,
    variant: 'default',
    ariaLabel: 'Slider',
    slideClass: '',
});

const [emblaRef, emblaApi] = useEmblaSlider(props.options, props.plugins);

const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const selectedIndex = ref(0);
const scrollSnaps = ref<number[]>([]);
const isAutoPlaying = ref(false);

const liveRegionText = computed(
    () => `Slajd ${selectedIndex.value + 1} z ${scrollSnaps.value.length}`,
);

function updateState(): void {
    if (!emblaApi.value) return;

    canScrollPrev.value = emblaApi.value.canScrollPrev();
    canScrollNext.value = emblaApi.value.canScrollNext();
    selectedIndex.value = emblaApi.value.selectedScrollSnap();
}

function updateScrollSnaps(): void {
    if (!emblaApi.value) return;

    scrollSnaps.value = emblaApi.value.scrollSnapList();
}

function handlePrevClick(): void {
    emblaApi.value?.scrollPrev();
}

function handleNextClick(): void {
    emblaApi.value?.scrollNext();
}

function handleDotClick(index: number): void {
    emblaApi.value?.scrollTo(index);
}

function focusDotByIndex(event: KeyboardEvent, index: number): void {
    nextTick(() => {
        const dotEl = event.currentTarget as HTMLElement;
        const parent = dotEl?.closest('[role="tablist"]');
        const buttons =
            parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');

        buttons?.[index]?.focus();
    });
}

function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        emblaApi.value?.scrollPrev();

        return;
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault();
        emblaApi.value?.scrollNext();

        return;
    }
}

function handleDotKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();

        const prevIndex =
            selectedIndex.value > 0
                ? selectedIndex.value - 1
                : scrollSnaps.value.length - 1;

        emblaApi.value?.scrollTo(prevIndex);
        focusDotByIndex(event, prevIndex);

        return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();

        const nextIndex =
            selectedIndex.value < scrollSnaps.value.length - 1
                ? selectedIndex.value + 1
                : 0;

        emblaApi.value?.scrollTo(nextIndex);
        focusDotByIndex(event, nextIndex);

        return;
    }

    if (event.key === 'Home') {
        event.preventDefault();
        emblaApi.value?.scrollTo(0);
        focusDotByIndex(event, 0);

        return;
    }

    if (event.key === 'End') {
        event.preventDefault();

        const lastIndex = scrollSnaps.value.length - 1;

        emblaApi.value?.scrollTo(lastIndex);
        focusDotByIndex(event, lastIndex);
    }
}

function checkAutoplay(): void {
    if (!emblaApi.value) return;

    try {
        const autoplay = emblaApi.value.plugins()?.autoplay;

        isAutoPlaying.value = autoplay?.isPlaying?.() ?? false;
    } catch {
        isAutoPlaying.value = false;
    }
}

watch(
    emblaApi,
    (api) => {
        if (!api) return;

        updateScrollSnaps();
        updateState();
        checkAutoplay();

        api.on('select', updateState);
        api.on('reInit', () => {
            updateScrollSnaps();
            updateState();
        });

        try {
            api.on('autoplay:play' as never, () => {
                isAutoPlaying.value = true;
            });
            api.on('autoplay:stop' as never, () => {
                isAutoPlaying.value = false;
            });
        } catch {
            // autoplay plugin not present
        }
    },
    { immediate: true },
);

defineExpose({ emblaApi });
</script>

<template>
    <div
        :aria-label="ariaLabel"
        aria-roledescription="carousel"
        role="region"
        class="relative"
        tabindex="0"
        @keydown="handleKeyDown"
    >
        <div
            ref="emblaRef"
            class="overflow-hidden rounded-xl"
            :aria-live="isAutoPlaying ? 'off' : 'polite'"
            aria-atomic="false"
        >
            <div class="flex touch-pan-y" :class="slideClass" role="list">
                <slot />
            </div>
        </div>

        <span class="sr-only" aria-live="polite" aria-atomic="true">
            {{ liveRegionText }}
        </span>

        <template v-if="showArrows">
            <Action
                :circle="true"
                :is-disabled="!canScrollPrev"
                variant="secondary"
                aria-label="Poprzedni slajd"
                class="absolute top-1/2 left-2 z-10 -translate-y-1/2 shadow-md"
                @click="handlePrevClick"
            >
                <Icon
                    name="heroicons:chevron-left"
                    class="size-5"
                    aria-hidden="true"
                />
            </Action>

            <Action
                :circle="true"
                :is-disabled="!canScrollNext"
                variant="secondary"
                aria-label="Następny slajd"
                class="absolute top-1/2 right-2 z-10 -translate-y-1/2 shadow-md"
                @click="handleNextClick"
            >
                <Icon
                    name="heroicons:chevron-right"
                    class="size-5"
                    aria-hidden="true"
                />
            </Action>
        </template>

        <div
            v-if="showDots && scrollSnaps.length > 1"
            class="mt-3 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Nawigacja slajdów"
        >
            <button
                v-for="(_, dotIndex) in scrollSnaps"
                :key="dotIndex"
                role="tab"
                :aria-selected="dotIndex === selectedIndex"
                :aria-label="`Slajd ${dotIndex + 1} z ${scrollSnaps.length}`"
                :tabindex="dotIndex === selectedIndex ? 0 : -1"
                :class="[
                    'h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                    dotIndex === selectedIndex
                        ? 'w-6 bg-sky-500 dark:bg-sky-400'
                        : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500',
                ]"
                @click="handleDotClick(dotIndex)"
                @keydown="handleDotKeyDown($event)"
            />
        </div>
    </div>
</template>
