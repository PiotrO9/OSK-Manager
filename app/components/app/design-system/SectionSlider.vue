<script setup lang="ts">
import Autoplay from 'embla-carousel-autoplay';
</script>

<template>
    <Card class="lg:col-span-2" aria-label="Card: Slider">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Slider
            </p>
        </template>

        <div class="space-y-8">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Basic (single slide)
                </p>
                <Slider
                    :options="{ loop: true }"
                    :show-dots="true"
                    aria-label="Basic carousel"
                >
                    <div
                        v-for="n in 5"
                        :key="`basic-${n}`"
                        role="listitem"
                        aria-roledescription="slide"
                        :aria-label="`Slajd ${n} z 5`"
                        class="flex min-w-0 flex-[0_0_100%] items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 p-6 text-xl font-bold text-white select-none sm:p-12 sm:text-2xl"
                    >
                        Slide {{ n }}
                    </div>
                </Slider>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Multi-slide (3 per view)
                </p>
                <Slider
                    :options="{
                        loop: false,
                        align: 'start',
                        slidesToScroll: 1,
                    }"
                    :show-dots="true"
                    variant="compact"
                    slide-class="gap-4"
                    aria-label="Multi slide carousel"
                >
                    <div
                        v-for="n in 8"
                        :key="`multi-${n}`"
                        role="listitem"
                        aria-roledescription="slide"
                        :aria-label="`Karta ${n} z 8`"
                        class="flex min-w-0 flex-[0_0_100%] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-base font-semibold text-slate-700 select-none sm:flex-[0_0_calc(50%-8px)] sm:p-8 sm:text-lg lg:flex-[0_0_calc(33.333%-11px)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                        Card {{ n }}
                    </div>
                </Slider>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Variable widths
                </p>
                <Slider
                    :options="{
                        loop: true,
                        align: 'center',
                        dragFree: true,
                    }"
                    :show-arrows="true"
                    :show-dots="false"
                    slide-class="gap-3"
                    aria-label="Variable width carousel"
                >
                    <div
                        v-for="(item, index) in [
                            {
                                w: 'flex-[0_0_40%]',
                                color: 'from-rose-500 to-pink-600',
                                label: 'Wide',
                            },
                            {
                                w: 'flex-[0_0_25%]',
                                color: 'from-amber-400 to-orange-500',
                                label: 'Narrow',
                            },
                            {
                                w: 'flex-[0_0_35%]',
                                color: 'from-emerald-500 to-teal-600',
                                label: 'Medium',
                            },
                            {
                                w: 'flex-[0_0_20%]',
                                color: 'from-violet-500 to-purple-600',
                                label: 'Small',
                            },
                            {
                                w: 'flex-[0_0_45%]',
                                color: 'from-cyan-500 to-blue-600',
                                label: 'Extra wide',
                            },
                            {
                                w: 'flex-[0_0_30%]',
                                color: 'from-fuchsia-500 to-pink-500',
                                label: 'Regular',
                            },
                        ]"
                        :key="`var-${index}`"
                        role="listitem"
                        aria-roledescription="slide"
                        :aria-label="`${item.label} — slajd ${index + 1} z 6`"
                        :class="[
                            item.w,
                            'flex min-w-0 items-center justify-center rounded-xl bg-linear-to-br p-6 text-sm font-semibold text-white select-none',
                            item.color,
                        ]"
                    >
                        {{ item.label }}
                    </div>
                </Slider>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Testimonials (no arrows, dots only)
                </p>
                <Slider
                    :options="{ loop: true }"
                    :show-arrows="false"
                    :show-dots="true"
                    aria-label="Testimonials carousel"
                >
                    <div
                        v-for="(testimonial, index) in [
                            {
                                text: 'This starter kit saved me days of setup. Everything just works out of the box!',
                                author: 'Anna K.',
                                role: 'Frontend developer',
                            },
                            {
                                text: 'The design system is clean and well-organized. A great foundation for any project.',
                                author: 'Marek P.',
                                role: 'Tech lead',
                            },
                            {
                                text: 'Beautiful defaults and very easy to customize. Highly recommended!',
                                author: 'Julia W.',
                                role: 'UI designer',
                            },
                        ]"
                        :key="`test-${index}`"
                        role="listitem"
                        aria-roledescription="slide"
                        :aria-label="`Opinia ${testimonial.author} — slajd ${index + 1} z 3`"
                        class="flex min-w-0 flex-[0_0_100%] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center select-none sm:px-8 sm:py-10 dark:border-slate-700 dark:bg-slate-800"
                    >
                        <p
                            class="max-w-xl text-lg leading-relaxed text-slate-700 italic dark:text-slate-300"
                        >
                            "{{ testimonial.text }}"
                        </p>
                        <div>
                            <p
                                class="font-semibold text-slate-900 dark:text-slate-50"
                            >
                                {{ testimonial.author }}
                            </p>
                            <p
                                class="text-sm text-slate-500 dark:text-slate-400"
                            >
                                {{ testimonial.role }}
                            </p>
                        </div>
                    </div>
                </Slider>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Autoplay (loop + progress bar)
                </p>
                <Slider
                    :options="{ loop: true }"
                    :plugins="[
                        Autoplay({
                            delay: 3000,
                            stopOnInteraction: false,
                            stopOnMouseEnter: true,
                        }),
                    ]"
                    :show-arrows="true"
                    :show-dots="true"
                    aria-label="Autoplay carousel"
                >
                    <div
                        v-for="(slide, index) in [
                            {
                                title: 'Performance',
                                description:
                                    'Lightweight core with zero dependencies.',
                                icon: 'heroicons:bolt',
                                gradient: 'from-amber-500 to-orange-600',
                            },
                            {
                                title: 'Accessible',
                                description:
                                    'Keyboard navigation and screen reader support.',
                                icon: 'heroicons:eye',
                                gradient: 'from-emerald-500 to-teal-600',
                            },
                            {
                                title: 'Responsive',
                                description:
                                    'Works great on any screen size and device.',
                                icon: 'heroicons:device-phone-mobile',
                                gradient: 'from-violet-500 to-purple-600',
                            },
                            {
                                title: 'Extensible',
                                description:
                                    'Rich plugin system for autoplay, fade, and more.',
                                icon: 'heroicons:puzzle-piece',
                                gradient: 'from-sky-500 to-indigo-600',
                            },
                        ]"
                        :key="`auto-${index}`"
                        role="listitem"
                        aria-roledescription="slide"
                        :aria-label="`${slide.title} — slajd ${index + 1} z 4`"
                        class="flex min-w-0 flex-[0_0_100%] flex-col items-center justify-center gap-4 rounded-xl bg-linear-to-br p-6 text-center text-white select-none sm:p-12"
                        :class="slide.gradient"
                    >
                        <Icon
                            :name="slide.icon"
                            class="size-12 opacity-90"
                            aria-hidden="true"
                        />
                        <p class="text-2xl font-bold">
                            {{ slide.title }}
                        </p>
                        <p class="max-w-md text-base text-white/80">
                            {{ slide.description }}
                        </p>
                    </div>
                </Slider>
            </div>
        </div>
    </Card>
</template>
