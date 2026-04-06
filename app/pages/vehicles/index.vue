<script setup lang="ts">
import { Car, LayoutList, Pencil, Shield, Trash2 } from 'lucide-vue-next';
import { normalizeDrivingSchool } from '~/types/drivingSchool';
import type { Vehicle } from '~/types/vehicle';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pojazdy',
    description: () => 'Lista pojazdów szkoły jazdy.',
});

const route = useRoute();
const { session } = useAuthSession();
const { fetchList, isListLoading, deleteVehicle, isDeleteLoading } =
    useVehiclesApi();

const isManager = computed(() => session.value?.role === 'MANAGER');

const resolvedSchoolId = ref<string | null>(null);
const contextMessage = ref<string | null>(null);
const loadError = ref<string | null>(null);
const deleteActionError = ref<string | null>(null);
const vehicles = ref<Vehicle[]>([]);
const vehiclePendingDelete = ref<Vehicle | null>(null);

type PanelId = 'simple' | 'manager';

const activePanel = ref<PanelId>('simple');

const defaultOskUrl = () => resolveBffEndpoint('/api/driving-schools/default');
const { execute: fetchDefaultOsk } = useApi<unknown>('GET', defaultOskUrl);

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '—';
}

function handleTabSelect(panel: PanelId) {
    activePanel.value = panel;
}

function handleTabKeydown(event: KeyboardEvent, panel: PanelId) {
    if (isEnterOrSpaceKey(event)) {
        event.preventDefault();
        activePanel.value = panel;
    }
}

function readSchoolIdFromQuery(): string | null {
    const raw = route.query.schoolId;
    const s = Array.isArray(raw) ? raw[0] : raw;

    if (typeof s !== 'string') return null;

    const t = s.trim();

    return t.length > 0 ? t : null;
}

async function resolveSchoolId(): Promise<string | null> {
    contextMessage.value = null;

    const fromQuery = readSchoolIdFromQuery();

    if (fromQuery) {
        return fromQuery;
    }

    if (!isManager.value) {
        contextMessage.value =
            'Brak wybranej szkoły. Użyj linku z identyfikatorem szkoły (parametr schoolId) lub zapytaj administratora.';

        return null;
    }

    const raw = await fetchDefaultOsk();

    if (raw === null) {
        contextMessage.value = 'Nie udało się pobrać domyślnej szkoły jazdy.';

        return null;
    }

    try {
        const data = unwrapApiSuccessData<unknown>(raw);

        if (data === null || data === undefined) {
            await navigateTo('/manager/osk');

            return null;
        }

        const school = normalizeDrivingSchool(data);

        if (!school) {
            await navigateTo('/manager/osk');

            return null;
        }

        return school.id;
    } catch {
        contextMessage.value = 'Nie udało się wczytać danych szkoły jazdy.';

        return null;
    }
}

async function loadVehicles() {
    const sid = resolvedSchoolId.value;

    if (!sid) {
        vehicles.value = [];

        return;
    }

    loadError.value = null;

    try {
        vehicles.value = await fetchList(sid);
    } catch (err) {
        loadError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się wczytać listy pojazdów.';
        vehicles.value = [];
    }
}

async function runPageLoad() {
    resolvedSchoolId.value = await resolveSchoolId();

    if (!resolvedSchoolId.value) {
        vehicles.value = [];

        return;
    }

    await loadVehicles();
}

onMounted(() => {
    void runPageLoad();
});

watch(
    () => route.query.schoolId,
    () => {
        void runPageLoad();
    },
);

function handleRequestDeleteVehicle(vehicle: Vehicle) {
    deleteActionError.value = null;
    vehiclePendingDelete.value = vehicle;
}

function handleVehicleDeleteDialogOpen(open: boolean) {
    if (!open) {
        vehiclePendingDelete.value = null;
    }
}

function handleCancelDeleteVehicle() {
    vehiclePendingDelete.value = null;
}

function readDeleteErrorStatusCode(err: unknown): number | undefined {
    if (err === null || typeof err !== 'object') return undefined;

    if (!('statusCode' in err)) return undefined;

    const raw = (err as { statusCode: unknown }).statusCode;

    return typeof raw === 'number' ? raw : undefined;
}

async function handleConfirmDeleteVehicle() {
    const target = vehiclePendingDelete.value;
    const sid = resolvedSchoolId.value;

    if (!target || !sid) return;

    vehiclePendingDelete.value = null;
    deleteActionError.value = null;

    try {
        await deleteVehicle(target.id);
        await loadVehicles();
    } catch (err) {
        if (readDeleteErrorStatusCode(err) === 404) {
            await loadVehicles();

            return;
        }

        deleteActionError.value =
            err instanceof Error
                ? err.message
                : 'Nie udało się usunąć pojazdu.';
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Pojazdy
            </h1>
            <p class="text-muted-foreground text-sm">
                Lista pojazdów przypisanych do szkoły jazdy.
            </p>
        </div>

        <p
            v-if="contextMessage"
            class="text-muted-foreground text-sm"
            role="status"
        >
            {{ contextMessage }}
        </p>

        <template v-else>
            <div
                v-if="isManager"
                class="border-border flex flex-wrap gap-2 border-b pb-3"
                role="tablist"
                aria-label="Widok listy pojazdów"
            >
                <button
                    type="button"
                    role="tab"
                    class="focus-visible:ring-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    :class="
                        activePanel === 'simple'
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    "
                    :aria-selected="activePanel === 'simple'"
                    tabindex="0"
                    @click="handleTabSelect('simple')"
                    @keydown="handleTabKeydown($event, 'simple')"
                >
                    <LayoutList class="size-4 shrink-0" aria-hidden="true" />
                    Lista
                </button>
                <button
                    type="button"
                    role="tab"
                    class="focus-visible:ring-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    :class="
                        activePanel === 'manager'
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    "
                    :aria-selected="activePanel === 'manager'"
                    tabindex="0"
                    @click="handleTabSelect('manager')"
                    @keydown="handleTabKeydown($event, 'manager')"
                >
                    <Shield class="size-4 shrink-0" aria-hidden="true" />
                    Status i domyślny
                </button>
            </div>

            <div
                v-if="isManager && resolvedSchoolId"
                class="flex flex-wrap items-center gap-2"
            >
                <UiButton as-child variant="default" size="sm">
                    <NuxtLink
                        :to="{
                            path: '/vehicles/new',
                            query: { schoolId: resolvedSchoolId },
                        }"
                    >
                        Dodaj pojazd
                    </NuxtLink>
                </UiButton>
            </div>

            <p v-if="loadError" class="text-destructive text-sm" role="alert">
                {{ loadError }}
            </p>

            <p
                v-if="deleteActionError"
                class="text-destructive text-sm"
                role="alert"
            >
                {{ deleteActionError }}
            </p>

            <div
                v-else-if="isListLoading && vehicles.length === 0"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie listy pojazdów…
            </div>

            <div
                v-else-if="vehicles.length === 0"
                class="border-border bg-muted/20 rounded-2xl border border-dashed px-6 py-10 text-center"
                role="status"
            >
                <Car
                    class="text-muted-foreground mx-auto mb-3 size-10"
                    aria-hidden="true"
                />
                <p class="text-foreground font-medium">Brak pojazdów</p>
                <p class="text-muted-foreground mt-1 text-sm">
                    Nie zarejestrowano jeszcze żadnego pojazdu dla tej szkoły.
                </p>
                <div
                    v-if="isManager"
                    class="mt-4 flex flex-col items-center gap-2"
                >
                    <UiButton
                        v-if="resolvedSchoolId"
                        as-child
                        variant="secondary"
                        size="sm"
                    >
                        <NuxtLink
                            :to="{
                                path: '/vehicles/new',
                                query: { schoolId: resolvedSchoolId },
                            }"
                        >
                            Dodaj pojazd
                        </NuxtLink>
                    </UiButton>
                    <NuxtLink
                        to="/manager/osk"
                        class="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
                    >
                        Zarządzaj szkołami jazdy
                    </NuxtLink>
                </div>
            </div>

            <ul
                v-else
                class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
            >
                <li
                    v-for="vehicle in vehicles"
                    :key="vehicle.id"
                    role="listitem"
                    class="border-border min-w-0 rounded-2xl border bg-white p-5 transition dark:bg-transparent"
                >
                    <div class="flex items-start gap-3">
                        <div
                            class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-xl"
                        >
                            <Car class="size-4" aria-hidden="true" />
                        </div>
                        <div class="min-w-0 flex-1 space-y-2">
                            <div
                                class="flex min-w-0 items-start justify-between gap-2"
                            >
                                <div class="min-w-0">
                                    <p
                                        :id="`vehicle-name-${vehicle.id}`"
                                        class="text-foreground font-semibold break-words"
                                    >
                                        {{ displayText(vehicle.name) }}
                                    </p>
                                    <p
                                        class="text-muted-foreground mt-0.5 font-mono text-sm tracking-wide"
                                        :aria-labelledby="`vehicle-name-${vehicle.id}`"
                                    >
                                        {{
                                            displayText(
                                                vehicle.registrationNumber,
                                            )
                                        }}
                                    </p>
                                </div>
                                <div
                                    v-if="isManager && resolvedSchoolId"
                                    class="flex shrink-0 items-center gap-0.5"
                                >
                                    <UiButton
                                        as-child
                                        variant="ghost"
                                        size="icon"
                                        class="cursor-pointer"
                                    >
                                        <NuxtLink
                                            :to="{
                                                path: `/vehicles/${vehicle.id}/edit`,
                                                query: {
                                                    schoolId: resolvedSchoolId,
                                                },
                                            }"
                                            class="inline-flex size-9 items-center justify-center"
                                            :aria-label="`Edytuj pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                        >
                                            <Pencil
                                                class="size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        </NuxtLink>
                                    </UiButton>
                                    <UiButton
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        class="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 cursor-pointer"
                                        :disabled="isDeleteLoading"
                                        :aria-label="`Usuń pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                        @click="
                                            handleRequestDeleteVehicle(vehicle)
                                        "
                                    >
                                        <Trash2
                                            class="size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                    </UiButton>
                                </div>
                            </div>

                            <div
                                v-if="isManager && activePanel === 'manager'"
                                class="flex flex-wrap items-center gap-2"
                            >
                                <UiBadge
                                    v-if="vehicle.status === 'UNAVAILABLE'"
                                    variant="destructive"
                                    class="shrink-0"
                                >
                                    Niedostępny
                                </UiBadge>
                                <UiBadge
                                    v-else
                                    variant="secondary"
                                    class="shrink-0"
                                >
                                    Aktywny
                                </UiBadge>
                                <span
                                    v-if="vehicle.isDefault"
                                    class="bg-primary/15 text-primary shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
                                >
                                    Domyślny
                                </span>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>

            <VehicleDeleteDialog
                :open="vehiclePendingDelete !== null"
                :vehicle-name="
                    vehiclePendingDelete
                        ? displayText(vehiclePendingDelete.name)
                        : ''
                "
                :registration-number="
                    vehiclePendingDelete
                        ? displayText(vehiclePendingDelete.registrationNumber)
                        : ''
                "
                :is-deleting="isDeleteLoading"
                @update:open="handleVehicleDeleteDialogOpen"
                @cancel="handleCancelDeleteVehicle"
                @confirm="handleConfirmDeleteVehicle"
            />
        </template>
    </div>
</template>
