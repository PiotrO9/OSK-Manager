<script setup lang="ts">
import {
    normalizeInstructorDetail,
    type InstructorDetail,
} from '~/types/instructor';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import { resolveBffEndpoint } from '~/utils/bffEndpoint';

definePageMeta({
    layout: 'app-shell',
    middleware: ['manager'],
});

const instructor = ref<InstructorDetail | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

usePageMeta({
    title: () => instructor.value?.name?.trim() || 'Instruktor',
    description: () => 'Szczegóły instruktora.',
});

const route = useRoute();

let fetchSeq = 0;

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '—';
}

function getNotFoundMessage(): string {
    return 'Nie znaleziono instruktora.';
}

function getGenericLoadErrorMessage(): string {
    return 'Nie udało się wczytać danych instruktora.';
}

async function loadInstructor(rawId: unknown) {
    errorMessage.value = null;

    const id =
        typeof rawId === 'string'
            ? rawId.trim()
            : Array.isArray(rawId)
              ? String(rawId[0] ?? '').trim()
              : '';

    if (!id) {
        instructor.value = null;
        errorMessage.value = getNotFoundMessage();
        isLoading.value = false;

        return;
    }

    const seq = ++fetchSeq;

    isLoading.value = true;
    instructor.value = null;

    try {
        const url = resolveBffEndpoint(
            `/api/instructors/${encodeURIComponent(id)}`,
        );

        const raw = await $fetch<unknown>(url, { credentials: 'include' });
        const data = unwrapApiSuccessData<unknown>(raw);
        const normalized = normalizeInstructorDetail(data);

        if (seq !== fetchSeq) {
            return;
        }

        if (!normalized) {
            errorMessage.value = getNotFoundMessage();
            instructor.value = null;

            return;
        }

        instructor.value = normalized;
    } catch (err: unknown) {
        if (seq !== fetchSeq) {
            return;
        }

        const status = getApiErrorStatusCode(err);

        if (status === 404 || status === 400) {
            errorMessage.value = getNotFoundMessage();
        } else {
            errorMessage.value = getApiFetchErrorMessage(
                err,
                getGenericLoadErrorMessage(),
            );
        }

        instructor.value = null;
    } finally {
        if (seq === fetchSeq) {
            isLoading.value = false;
        }
    }
}

watch(
    () => route.params.id,
    (id) => {
        void loadInstructor(id);
    },
    { immediate: true },
);
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Szczegóły instruktora
            </h1>
            <p class="text-muted-foreground text-sm">
                Informacje o instruktorze — tylko do odczytu.
            </p>
        </div>

        <p
            v-if="isLoading"
            class="text-muted-foreground text-sm"
            role="status"
            aria-live="polite"
        >
            Wczytywanie danych instruktora…
        </p>

        <p
            v-else-if="errorMessage"
            class="text-destructive text-sm"
            role="alert"
            aria-live="polite"
        >
            {{ errorMessage }}
        </p>

        <div
            v-else-if="instructor !== null"
            class="border-border bg-card max-w-2xl min-w-0 space-y-6 rounded-2xl border p-6 shadow-sm"
        >
            <div class="min-w-0 space-y-1">
                <h2
                    class="text-foreground text-lg font-semibold wrap-break-word"
                >
                    {{ displayText(instructor.name) }}
                </h2>
                <p class="text-muted-foreground text-sm break-all">
                    {{ displayText(instructor.email) }}
                </p>
            </div>

            <dl
                class="border-border grid gap-4 border-t pt-6 sm:grid-cols-2"
                aria-label="Dane instruktora"
            >
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Numer licencji
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.licenseNumber) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Numer telefonu
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.phone) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Kwalifikacje
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.qualifications) }}
                    </dd>
                </div>
                <div>
                    <dt class="text-muted-foreground text-xs font-medium">
                        Doświadczenie
                    </dt>
                    <dd class="text-foreground mt-1 text-sm font-medium">
                        {{ displayText(instructor.experience) }}
                    </dd>
                </div>
            </dl>
        </div>

        <NuxtLink
            to="/manager/instructors"
            class="text-primary focus-visible:ring-ring inline-flex rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Wróć do listy instruktorów"
        >
            Wróć do listy instruktorów
        </NuxtLink>
    </div>
</template>
