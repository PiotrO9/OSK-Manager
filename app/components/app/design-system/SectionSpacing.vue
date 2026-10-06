<template>
    <FormSection
        title="Odstępy i rozmiary"
        description="Skala odstępów, promienie i wysokości kontrolek używane w aplikacji."
    >
        <div class="grid min-w-0 gap-6 md:grid-cols-3">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-medium">Odstępy</p>
                <div
                    v-for="size in [4, 8, 12, 16, 24, 32]"
                    :key="size"
                    class="flex items-center gap-3"
                >
                    <code
                        class="text-muted-foreground w-10 text-xs tabular-nums"
                        >{{ size }} px</code
                    >
                    <span
                        class="bg-primary h-3 rounded-sm"
                        :style="{ width: `${size}px` }"
                        aria-hidden="true"
                    />
                </div>
            </div>
            <div class="space-y-3">
                <p class="text-foreground text-sm font-medium">Promienie</p>
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="radius in [4, 6, 8]"
                        :key="radius"
                        class="space-y-2 text-center"
                    >
                        <span
                            class="border-border bg-muted block size-12 border"
                            :style="{ borderRadius: `${radius}px` }"
                            aria-hidden="true"
                        />
                        <code class="text-muted-foreground text-xs"
                            >{{ radius }} px</code
                        >
                    </div>
                </div>
            </div>
            <div class="space-y-3">
                <p class="text-foreground text-sm font-medium">
                    Wysokości kontrolek
                </p>
                <UiButton size="sm" class="h-8">Kompaktowa · 32 px</UiButton>
                <UiButton class="h-10">Standardowa · 40 px</UiButton>
                <UiButton variant="outline" class="h-11"
                    >Dotykowa · 44 px</UiButton
                >
            </div>
        </div>
    </FormSection>
</template>
