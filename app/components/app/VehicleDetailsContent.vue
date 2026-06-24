<script setup lang="ts">
import {
    ArrowLeft,
    CalendarCheck,
    Car,
    Gauge,
    ListChecks,
    Pencil,
    ShieldCheck,
    Wrench,
} from 'lucide-vue-next';
import type { RouteLocationRaw } from 'vue-router';
import type { StatusTone } from '~/components/app/ui/types';
import type { VehicleDetail } from '~/types/vehicle';

const props = defineProps<{
    vehicle: VehicleDetail;
    backToListHref: RouteLocationRaw;
    editHref: RouteLocationRaw;
}>();

function displayText(value: string): string {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '--';
}

function displayOptional(value: string | number | null): string {
    if (value === null) return '--';

    if (typeof value === 'number') {
        return new Intl.NumberFormat('pl-PL').format(value);
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '--';
}

function displayDate(value: string | null): string {
    if (!value) return '--';

    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

const vehicleTitle = computed(() => displayText(props.vehicle.name));

const vehicleInitials = computed(() => {
    const source =
        props.vehicle.name.trim() || props.vehicle.registrationNumber.trim();
    const initials = source
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return initials.length > 0 ? initials.toUpperCase() : 'PO';
});

const availability = computed(() => {
    if (props.vehicle.status === 'UNAVAILABLE') {
        return {
            label: 'Niedostępny',
            tone: 'danger' as StatusTone,
            description: 'Pojazd oznaczony jako niedostępny.',
        };
    }

    return {
        label: 'Aktywny',
        tone: 'success' as StatusTone,
        description: 'Pojazd może być używany w harmonogramie.',
    };
});

const overviewItems = computed(() => [
    {
        label: 'Status techniczny',
        description:
            props.vehicle.inspectionDate || props.vehicle.insuranceDate
                ? 'Przeglad i OC sa zapisane w danych pojazdu.'
                : 'Brak dat przegladu lub OC w danych pojazdu.',
        badge:
            props.vehicle.inspectionDate && props.vehicle.insuranceDate
                ? 'OK'
                : 'Uzupelnij',
        tone:
            props.vehicle.inspectionDate && props.vehicle.insuranceDate
                ? ('success' as StatusTone)
                : ('warning' as StatusTone),
        icon: ShieldCheck,
    },
    {
        label: 'Dostepnosc',
        description: availability.value.description,
        badge: availability.value.label,
        tone: availability.value.tone,
        icon: CalendarCheck,
    },
    {
        label: 'Domyślny pojazd',
        description: props.vehicle.isDefault
            ? 'Ten pojazd jest domyslny dla OSK.'
            : 'Domyślny pojazd można ustawić z listy pojazdów.',
        badge: props.vehicle.isDefault ? 'Tak' : 'Nie',
        tone: props.vehicle.isDefault
            ? ('info' as StatusTone)
            : ('neutral' as StatusTone),
        icon: Car,
    },
]);

const profileRows = computed(() => [
    { label: 'Status', value: availability.value.label },
    {
        label: 'Rejestracja',
        value: displayText(props.vehicle.registrationNumber),
    },
    { label: 'Rocznik', value: displayOptional(props.vehicle.modelYear) },
    {
        label: 'Przebieg',
        value:
            props.vehicle.mileageKm === null
                ? '--'
                : `${displayOptional(props.vehicle.mileageKm)} km`,
    },
]);

const activityItems = computed(() => [
    {
        label: 'Data przegladu',
        description: displayDate(props.vehicle.inspectionDate),
        badge: props.vehicle.inspectionDate ? 'Zapisana' : 'Brak',
        tone: props.vehicle.inspectionDate
            ? ('success' as StatusTone)
            : ('warning' as StatusTone),
    },
    {
        label: 'Data ubezpieczenia',
        description: displayDate(props.vehicle.insuranceDate),
        badge: props.vehicle.insuranceDate ? 'Zapisana' : 'Brak',
        tone: props.vehicle.insuranceDate
            ? ('success' as StatusTone)
            : ('warning' as StatusTone),
    },
    {
        label: 'Dane eksploatacyjne',
        description: `Rocznik: ${displayOptional(props.vehicle.modelYear)}; przebieg: ${
            props.vehicle.mileageKm === null
                ? '--'
                : `${displayOptional(props.vehicle.mileageKm)} km`
        }`,
        badge: 'Widoczne',
        tone: 'neutral' as StatusTone,
    },
]);

const relatedItems = computed(() => [
    {
        label: 'Edycja danych',
        description: 'Formularz edycji zachowuje pola pojazdu i zdjecie.',
        to: props.editHref,
        badge: 'Dostepna',
        icon: Pencil,
    },
    {
        label: 'Lista pojazdów',
        description: 'Status, domyslnosc i usuwanie zostaja w panelu listy.',
        to: props.backToListHref,
        badge: 'Widoczna',
        icon: ListChecks,
    },
]);
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            :title="vehicleTitle"
            description="Szczegóły pojazdu, status i najważniejsze dane techniczne."
            eyebrow="Pojazd"
        >
            <template #actions>
                <UiButton
                    as-child
                    variant="outline"
                    class="bg-background h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="props.backToListHref"
                        aria-label="Wróć do listy pojazdów"
                    >
                        <ArrowLeft class="mr-2 size-4" aria-hidden="true" />
                        Lista pojazdów
                    </NuxtLink>
                </UiButton>
                <UiButton
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink :to="props.editHref" aria-label="Edytuj pojazd">
                        <Pencil class="mr-2 size-4" aria-hidden="true" />
                        Edytuj
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <div class="grid min-w-0 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardContent class="space-y-5 p-5">
                    <div class="flex items-start gap-4 xl:flex-col">
                        <div
                            class="bg-muted relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-extrabold text-sky-700"
                            aria-hidden="true"
                        >
                            <img
                                v-if="props.vehicle.photoUrl"
                                :src="props.vehicle.photoUrl"
                                :alt="`Zdjecie pojazdu ${vehicleTitle}`"
                                class="size-full object-cover"
                            />
                            <span v-else>{{ vehicleInitials }}</span>
                        </div>

                        <div class="min-w-0">
                            <h2
                                class="text-foreground truncate text-xl font-extrabold"
                            >
                                {{ vehicleTitle }}
                            </h2>
                            <p class="text-muted-foreground mt-1 text-sm">
                                Pojazd szkoleniowy
                                <span
                                    v-if="
                                        props.vehicle.registrationNumber.trim()
                                            .length > 0
                                    "
                                >
                                    -
                                    {{
                                        displayText(
                                            props.vehicle.registrationNumber,
                                        )
                                    }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <dl class="divide-border divide-y">
                        <div
                            v-for="row in profileRows"
                            :key="row.label"
                            class="flex items-center justify-between gap-4 py-3"
                        >
                            <dt class="text-muted-foreground text-sm">
                                {{ row.label }}
                            </dt>
                            <dd
                                class="text-foreground max-w-[180px] min-w-0 truncate text-right text-sm font-bold"
                            >
                                {{ row.value }}
                            </dd>
                        </div>
                    </dl>

                    <div class="flex flex-wrap gap-2">
                        <StatusBadge
                            :label="availability.label"
                            :tone="availability.tone"
                        />
                        <StatusBadge
                            v-if="props.vehicle.isDefault"
                            label="Domyślny"
                            tone="info"
                            subtle
                        />
                    </div>
                </UiCardContent>
            </UiCard>

            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader
                    class="border-border flex flex-row items-start justify-between gap-4 border-b p-5"
                >
                    <div class="min-w-0">
                        <UiCardTitle class="text-xl font-extrabold">
                            Przeglad
                        </UiCardTitle>
                        <UiCardDescription>
                            Najwazniejsze dane i akcje dla tego widoku.
                        </UiCardDescription>
                    </div>
                    <StatusBadge label="Aktualne" tone="info" subtle />
                </UiCardHeader>

                <UiCardContent class="space-y-3 p-4">
                    <div
                        v-for="item in overviewItems"
                        :key="item.label"
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div class="flex min-w-0 gap-3">
                            <span
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                aria-hidden="true"
                            >
                                <component :is="item.icon" class="size-4" />
                            </span>
                            <span class="min-w-0">
                                <span class="text-foreground block font-bold">
                                    {{ item.label }}
                                </span>
                                <span
                                    class="text-muted-foreground mt-1 block text-sm"
                                >
                                    {{ item.description }}
                                </span>
                            </span>
                        </div>
                        <StatusBadge
                            :label="item.badge"
                            :tone="item.tone"
                            subtle
                        />
                    </div>
                </UiCardContent>
            </UiCard>
        </div>

        <div class="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5">
                    <div class="flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <UiCardTitle class="text-xl font-extrabold">
                                Dane techniczne
                            </UiCardTitle>
                            <UiCardDescription>
                                Daty, przebieg i parametry zachowane po
                                redesignie.
                            </UiCardDescription>
                        </div>
                        <Wrench
                            class="text-muted-foreground size-5 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                </UiCardHeader>

                <UiCardContent class="space-y-3 p-4">
                    <div
                        v-for="item in activityItems"
                        :key="item.label"
                        class="border-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div class="min-w-0">
                            <p class="font-extrabold">{{ item.label }}</p>
                            <p class="text-muted-foreground mt-1 text-sm">
                                {{ item.description }}
                            </p>
                        </div>
                        <StatusBadge
                            :label="item.badge"
                            :tone="item.tone"
                            subtle
                        />
                    </div>
                </UiCardContent>
            </UiCard>

            <UiCard class="overflow-hidden rounded-2xl shadow-sm">
                <UiCardHeader class="border-border border-b p-5">
                    <div class="flex items-start justify-between gap-3">
                        <div class="space-y-1">
                            <UiCardTitle class="text-xl font-extrabold">
                                Powiazane dane
                            </UiCardTitle>
                            <UiCardDescription>
                                Elementy, ktorych nie można zgubic po
                                redesignie.
                            </UiCardDescription>
                        </div>
                        <Gauge
                            class="text-muted-foreground size-5 shrink-0"
                            aria-hidden="true"
                        />
                    </div>
                </UiCardHeader>

                <UiCardContent class="space-y-3 p-4">
                    <NuxtLink
                        v-for="item in relatedItems"
                        :key="item.label"
                        :to="item.to"
                        class="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <span class="flex min-w-0 items-center gap-3">
                            <span
                                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                                aria-hidden="true"
                            >
                                <component :is="item.icon" class="size-4" />
                            </span>
                            <span class="min-w-0">
                                <span class="text-foreground block font-bold">
                                    {{ item.label }}
                                </span>
                                <span
                                    class="text-muted-foreground mt-1 block text-sm"
                                >
                                    {{ item.description }}
                                </span>
                            </span>
                        </span>
                        <StatusBadge :label="item.badge" subtle />
                    </NuxtLink>
                </UiCardContent>
            </UiCard>
        </div>
    </div>
</template>
