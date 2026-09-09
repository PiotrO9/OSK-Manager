<script setup lang="ts">
import { Menu } from 'lucide-vue-next';
import type {
    DesignSystemSection,
    DesignSystemSectionId,
} from '~/data/design-system/sections';

defineProps<{
    sections: readonly DesignSystemSection[];
    activeSection: DesignSystemSectionId;
}>();

const emit = defineEmits<{
    select: [id: DesignSystemSectionId];
}>();

const isMobileOpen = shallowRef(false);

function selectSection(id: DesignSystemSectionId) {
    emit('select', id);
    isMobileOpen.value = false;
}
</script>

<template>
    <aside class="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <nav
            class="border-border bg-card hidden rounded-lg border p-2 lg:block"
            aria-label="Sekcje design systemu"
        >
            <button
                v-for="(section, index) in sections"
                :key="section.id"
                type="button"
                class="focus-visible:ring-ring flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left outline-none focus-visible:ring-2"
                :class="
                    section.id === activeSection
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                "
                :aria-current="
                    section.id === activeSection ? 'page' : undefined
                "
                @click="selectSection(section.id)"
            >
                <span class="mt-0.5 text-xs font-semibold tabular-nums">
                    {{ String(index + 1).padStart(2, '0') }}
                </span>
                <span class="min-w-0">
                    <span class="block text-sm font-semibold">{{
                        section.label
                    }}</span>
                    <span
                        class="mt-0.5 block text-xs leading-4"
                        :class="
                            section.id === activeSection
                                ? 'text-primary-foreground/75'
                                : 'text-muted-foreground'
                        "
                    >
                        {{ section.description }}
                    </span>
                </span>
            </button>
        </nav>

        <UiSheet v-model:open="isMobileOpen">
            <UiSheetTrigger as-child>
                <UiButton
                    variant="outline"
                    class="w-full justify-start lg:hidden"
                >
                    <Menu aria-hidden="true" />
                    Sekcje design systemu
                </UiButton>
            </UiSheetTrigger>
            <UiSheetContent side="left" class="w-[min(88vw,340px)] p-0">
                <UiSheetHeader class="border-border border-b p-5 text-left">
                    <UiSheetTitle>Design system</UiSheetTitle>
                    <UiSheetDescription
                        >Wybierz obszar podglądu.</UiSheetDescription
                    >
                </UiSheetHeader>
                <nav
                    class="space-y-1 overflow-y-auto p-3"
                    aria-label="Sekcje design systemu"
                >
                    <button
                        v-for="section in sections"
                        :key="section.id"
                        type="button"
                        class="focus-visible:ring-ring w-full cursor-pointer rounded-md px-3 py-3 text-left text-sm font-medium outline-none focus-visible:ring-2"
                        :class="
                            section.id === activeSection
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                        "
                        @click="selectSection(section.id)"
                    >
                        {{ section.label }}
                    </button>
                </nav>
            </UiSheetContent>
        </UiSheet>
    </aside>
</template>
