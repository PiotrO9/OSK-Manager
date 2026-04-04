<script setup lang="ts">
import { Building2, MapPin, ExternalLink } from 'lucide-vue-next';
import {
    normalizeDrivingSchool,
    type DrivingSchool,
} from '~/types/drivingSchool';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pulpit',
    description: () => 'Panel zarządzania OSK.',
});

const { session } = useAuthSession();

const isManager = computed(() => session.value?.role === 'MANAGER');

const defaultOsk = ref<DrivingSchool | null>(null);
const defaultOskError = ref<string | null>(null);

const defaultUrl = () => resolveBffEndpoint('/api/driving-schools/default');
const { execute: fetchDefault, isLoading: isDefaultLoading } = useApi<unknown>(
    'GET',
    defaultUrl,
);

async function loadDefaultOsk() {
    if (!isManager.value) return;

    defaultOskError.value = null;

    const raw = await fetchDefault();

    if (raw === null) {
        defaultOskError.value = 'Nie udało się pobrać domyślnego OSK.';

        return;
    }

    try {
        const data = unwrapApiSuccessData<unknown>(raw);

        if (data === null || data === undefined) {
            navigateTo('/manager/osk');

            return;
        }

        const school = normalizeDrivingSchool(data);

        if (!school) {
            navigateTo('/manager/osk');

            return;
        }

        defaultOsk.value = school;
    } catch {
        defaultOskError.value = 'Nie udało się wczytać danych OSK.';
    }
}

onMounted(() => {
    loadDefaultOsk();
});
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Witaj{{ session?.userName ? `, ${session.userName}` : '' }}
            </h1>
            <p class="text-muted-foreground text-sm">
                {{
                    isManager
                        ? 'Twój panel zarządzania szkołą jazdy.'
                        : 'Panel aplikacji.'
                }}
            </p>
        </div>

        <template v-if="isManager">
            <div
                v-if="isDefaultLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie danych OSK…
            </div>

            <p
                v-else-if="defaultOskError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ defaultOskError }}
            </p>

            <div
                v-else-if="defaultOsk"
                class="border-border rounded-2xl border bg-white p-5 dark:bg-transparent"
                :aria-label="`Karta domyślnego OSK: ${defaultOsk.name}`"
            >
                <div class="flex items-start gap-4">
                    <div
                        class="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl"
                    >
                        <Building2 class="size-5" aria-hidden="true" />
                    </div>

                    <div class="min-w-0 flex-1 space-y-1">
                        <p
                            class="text-foreground truncate text-lg font-semibold"
                        >
                            {{ defaultOsk.name }}
                        </p>

                        <p
                            v-if="defaultOsk.city || defaultOsk.address"
                            class="text-muted-foreground flex items-center gap-1 text-sm"
                        >
                            <MapPin
                                class="size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span>
                                <span v-if="defaultOsk.city">{{
                                    defaultOsk.city
                                }}</span>
                                <span
                                    v-if="defaultOsk.city && defaultOsk.address"
                                >
                                    ·
                                </span>
                                <span v-if="defaultOsk.address">{{
                                    defaultOsk.address
                                }}</span>
                            </span>
                        </p>
                    </div>

                    <NuxtLink
                        to="/manager/osk"
                        class="text-muted-foreground hover:text-foreground focus-visible:ring-primary shrink-0 rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        aria-label="Przejdź do listy szkół jazdy"
                    >
                        <ExternalLink class="size-4" aria-hidden="true" />
                    </NuxtLink>
                </div>
            </div>
        </template>

        <template v-else>
            <p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Szkielet aplikacji z lewym panelem nawigacji. Treść modułów i
                statystyki możesz dodać tutaj później.
            </p>
        </template>
    </div>
</template>
