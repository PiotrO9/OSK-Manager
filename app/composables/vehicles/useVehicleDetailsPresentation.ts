import {
    CalendarCheck,
    Car,
    ListChecks,
    Pencil,
    ShieldCheck,
} from 'lucide-vue-next';
import type { Component, Ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import type { StatusTone } from '~/components/app/ui/types';
import type { VehicleDetail } from '~/types/vehicles/vehicle';
import {
    vehicleAvailabilityDescription,
    vehicleAvailabilityLabel,
    vehicleAvailabilityTone,
} from '~/utils/vehicles/availability';

interface UseVehicleDetailsPresentationOptions {
    backToListHref: Ref<RouteLocationRaw>;
    editHref: Ref<RouteLocationRaw>;
    vehicle: Ref<VehicleDetail>;
}

interface VehicleDetailsOverviewItem {
    label: string;
    description: string;
    badge: string;
    tone: StatusTone;
    icon: Component;
}

interface VehicleDetailsProfileRow {
    label: string;
    value: string;
}

interface VehicleDetailsActivityItem {
    label: string;
    description: string;
    badge: string;
    tone: StatusTone;
}

interface VehicleDetailsRelatedItem {
    label: string;
    description: string;
    to: RouteLocationRaw;
    badge: string;
    icon: Component;
}

export function useVehicleDetailsPresentation({
    backToListHref,
    editHref,
    vehicle,
}: UseVehicleDetailsPresentationOptions) {
    const vehicleTitle = computed(() =>
        displayVehicleDetailsText(vehicle.value.name),
    );

    const vehicleInitials = computed(() =>
        getVehicleDetailsInitials(
            vehicle.value.name,
            vehicle.value.registrationNumber,
        ),
    );
    const registrationNumberLabel = computed(() =>
        displayVehicleDetailsText(vehicle.value.registrationNumber),
    );

    const availability = computed(() => ({
        label: vehicleAvailabilityLabel(vehicle.value),
        tone: vehicleAvailabilityTone(vehicle.value) as StatusTone,
        description: vehicleAvailabilityDescription(vehicle.value),
    }));

    const overviewItems = computed<VehicleDetailsOverviewItem[]>(() => [
        {
            label: 'Status techniczny',
            description:
                vehicle.value.inspectionDate || vehicle.value.insuranceDate
                    ? 'Przeglad i OC sa zapisane w danych pojazdu.'
                    : 'Brak dat przegladu lub OC w danych pojazdu.',
            badge:
                vehicle.value.inspectionDate && vehicle.value.insuranceDate
                    ? 'OK'
                    : 'Uzupelnij',
            tone:
                vehicle.value.inspectionDate && vehicle.value.insuranceDate
                    ? 'success'
                    : 'warning',
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
            description: vehicle.value.isDefault
                ? 'Ten pojazd jest domyslny dla OSK.'
                : 'Domyślny pojazd można ustawić z listy pojazdów.',
            badge: vehicle.value.isDefault ? 'Tak' : 'Nie',
            tone: vehicle.value.isDefault ? 'info' : 'neutral',
            icon: Car,
        },
    ]);

    const profileRows = computed<VehicleDetailsProfileRow[]>(() => [
        { label: 'Status', value: availability.value.label },
        {
            label: 'Rejestracja',
            value: displayVehicleDetailsText(vehicle.value.registrationNumber),
        },
        {
            label: 'Rocznik',
            value: displayVehicleDetailsOptional(vehicle.value.modelYear),
        },
        {
            label: 'Przebieg',
            value:
                vehicle.value.mileageKm === null
                    ? '--'
                    : `${displayVehicleDetailsOptional(vehicle.value.mileageKm)} km`,
        },
    ]);

    const activityItems = computed<VehicleDetailsActivityItem[]>(() => [
        {
            label: 'Data przegladu',
            description: displayVehicleDetailsDate(
                vehicle.value.inspectionDate,
            ),
            badge: vehicle.value.inspectionDate ? 'Zapisana' : 'Brak',
            tone: vehicle.value.inspectionDate ? 'success' : 'warning',
        },
        {
            label: 'Data ubezpieczenia',
            description: displayVehicleDetailsDate(vehicle.value.insuranceDate),
            badge: vehicle.value.insuranceDate ? 'Zapisana' : 'Brak',
            tone: vehicle.value.insuranceDate ? 'success' : 'warning',
        },
        {
            label: 'Dane eksploatacyjne',
            description: `Rocznik: ${displayVehicleDetailsOptional(
                vehicle.value.modelYear,
            )}; przebieg: ${
                vehicle.value.mileageKm === null
                    ? '--'
                    : `${displayVehicleDetailsOptional(vehicle.value.mileageKm)} km`
            }`,
            badge: 'Widoczne',
            tone: 'neutral',
        },
    ]);

    const relatedItems = computed<VehicleDetailsRelatedItem[]>(() => [
        {
            label: 'Edycja danych',
            description: 'Formularz edycji zachowuje pola pojazdu i zdjecie.',
            to: editHref.value,
            badge: 'Dostepna',
            icon: Pencil,
        },
        {
            label: 'Lista pojazdów',
            description:
                'Status, domyslnosc i usuwanie zostaja w panelu listy.',
            to: backToListHref.value,
            badge: 'Widoczna',
            icon: ListChecks,
        },
    ]);

    return {
        activityItems,
        availability,
        overviewItems,
        profileRows,
        registrationNumberLabel,
        relatedItems,
        vehicleInitials,
        vehicleTitle,
    };
}

export function displayVehicleDetailsText(value: string): string {
    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '--';
}

export function displayVehicleDetailsOptional(
    value: string | number | null,
): string {
    if (value === null) return '--';

    if (typeof value === 'number') {
        return new Intl.NumberFormat('pl-PL').format(value);
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : '--';
}

export function displayVehicleDetailsDate(value: string | null): string {
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

export function getVehicleDetailsInitials(
    name: string,
    registrationNumber: string,
): string {
    const source = name.trim() || registrationNumber.trim();
    const initials = source
        .split(/\s+/)
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('');

    return initials.length > 0 ? initials.toUpperCase() : 'PO';
}
