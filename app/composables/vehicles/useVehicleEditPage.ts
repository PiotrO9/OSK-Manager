import type { HeaderMetaItem } from '~/components/app/ui/types';
import type {
    Vehicle,
    VehicleDetail,
    VehicleWritePayload,
} from '~/types/vehicles/vehicle';

export const VEHICLE_EDIT_FORM_ID = 'vehicle-edit-form';

export function useVehicleEditPage() {
    const route = useRoute();
    const {
        fetchList,
        fetchVehicleById,
        updateVehicle,
        uploadVehiclePhoto,
        isUpdateLoading,
        isPhotoUploadLoading,
    } = useVehiclesApi();

    const schoolId = computed(() => {
        const raw = route.query.schoolId;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') return null;

        const t = s.trim();

        return t.length > 0 ? t : null;
    });

    const vehicleId = computed(() => {
        const raw = route.params.id;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') return null;

        const t = s.trim();

        return t.length > 0 ? t : null;
    });

    const loadError = ref<string | null>(null);
    const vehicles = ref<Vehicle[]>([]);
    const isListBootloading = ref(false);
    const apiError = ref<string | null>(null);

    const vehicleDetail = ref<VehicleDetail | null>(null);
    const detailLoadError = ref<string | null>(null);
    const isDetailLoading = ref(false);
    const photoFileInput = ref<HTMLInputElement | null>(null);
    const photoUploadError = ref<string | null>(null);
    const pendingPhotoFile = ref<File | null>(null);
    const pendingPhotoObjectUrl = ref<string | null>(null);

    const initialVehicle = computed<Vehicle | null>(() => {
        const fromList = vehicles.value.find((v) => v.id === vehicleId.value);

        return fromList ?? vehicleDetail.value;
    });

    const vehicleTitle = computed(() => {
        const name = initialVehicle.value?.name.trim();

        return name && name.length > 0 ? name : 'Edytuj pojazd';
    });

    const headerMeta = computed<HeaderMetaItem[]>(() => {
        const vehicle = initialVehicle.value;

        if (!vehicle) return [];

        return [
            {
                label: 'Rejestracja',
                value: vehicle.registrationNumber || '-',
                tone: 'neutral',
            },
            {
                label: 'Status',
                value:
                    vehicle.status === 'UNAVAILABLE'
                        ? 'Niedostępny'
                        : 'Aktywny',
                tone: vehicle.status === 'UNAVAILABLE' ? 'warning' : 'success',
            },
        ];
    });

    const previewPhotoSrc = computed(() => {
        if (pendingPhotoObjectUrl.value) {
            return pendingPhotoObjectUrl.value;
        }

        const url = vehicleDetail.value?.photoUrl?.trim();

        return url && url.length > 0 ? url : null;
    });

    const pendingPhotoFileName = computed(
        () => pendingPhotoFile.value?.name ?? 'Nie wybrano pliku',
    );

    const isSaveBusy = computed(
        () => isUpdateLoading.value || isPhotoUploadLoading.value,
    );

    const vehiclesListRoute = computed(() => ({
        path: '/vehicles',
        query:
            schoolId.value !== null ? { schoolId: schoolId.value } : undefined,
    }));

    function revokePendingPhotoPreview() {
        if (pendingPhotoObjectUrl.value) {
            URL.revokeObjectURL(pendingPhotoObjectUrl.value);
            pendingPhotoObjectUrl.value = null;
        }

        pendingPhotoFile.value = null;
    }

    async function loadList() {
        const sid = schoolId.value;

        if (!sid) {
            vehicles.value = [];

            return;
        }

        loadError.value = null;
        isListBootloading.value = true;

        try {
            vehicles.value = await fetchList(sid);
        } catch (err) {
            loadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać listy pojazdów.';
            vehicles.value = [];
        } finally {
            isListBootloading.value = false;
        }
    }

    async function loadVehicleDetail() {
        const id = vehicleId.value;

        if (!id) {
            vehicleDetail.value = null;

            return;
        }

        isDetailLoading.value = true;
        detailLoadError.value = null;

        try {
            vehicleDetail.value = await fetchVehicleById(id);
        } catch (err) {
            detailLoadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać szczegółów pojazdu.';
            vehicleDetail.value = null;
        } finally {
            isDetailLoading.value = false;
        }
    }

    function resetPhotoInput(): void {
        revokePendingPhotoPreview();

        if (photoFileInput.value) {
            photoFileInput.value.value = '';
        }
    }

    function handlePhotoFileInputChange() {
        photoUploadError.value = null;

        if (pendingPhotoObjectUrl.value) {
            URL.revokeObjectURL(pendingPhotoObjectUrl.value);
            pendingPhotoObjectUrl.value = null;
        }

        const input = photoFileInput.value;
        const file = input?.files?.[0] ?? null;

        pendingPhotoFile.value = file;

        if (file) {
            pendingPhotoObjectUrl.value = URL.createObjectURL(file);
        }
    }

    async function handleVehicleSubmit(payload: VehicleWritePayload) {
        const id = vehicleId.value;
        const sid = schoolId.value;

        if (!id || !sid) return;

        apiError.value = null;
        photoUploadError.value = null;

        const file = pendingPhotoFile.value;

        if (file && file.size > 5 * 1024 * 1024) {
            photoUploadError.value = 'Plik jest za duzy (maks. 5 MB).';

            return;
        }

        try {
            await updateVehicle(id, payload);

            if (file) {
                try {
                    const photoUrl = await uploadVehiclePhoto(id, file);

                    if (vehicleDetail.value) {
                        vehicleDetail.value = {
                            ...vehicleDetail.value,
                            photoUrl,
                        };
                    }

                    resetPhotoInput();
                } catch (err) {
                    photoUploadError.value =
                        err instanceof Error
                            ? err.message
                            : 'Nie udało się przesłać zdjęcia.';

                    return;
                }
            }

            await navigateTo({
                path: '/vehicles',
                query: { schoolId: sid },
            });
        } catch (err) {
            apiError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się zapisać pojazdu.';
        }
    }

    watch(
        () => [schoolId.value, vehicleId.value] as const,
        () => {
            void loadList();
        },
        { immediate: true },
    );

    watch(
        vehicleId,
        () => {
            resetPhotoInput();
            void loadVehicleDetail();
        },
        { immediate: true },
    );

    onUnmounted(() => {
        revokePendingPhotoPreview();
    });

    return {
        apiError,
        detailLoadError,
        formId: VEHICLE_EDIT_FORM_ID,
        handlePhotoFileInputChange,
        handleVehicleSubmit,
        headerMeta,
        initialVehicle,
        isDetailLoading,
        isListBootloading,
        isSaveBusy,
        loadError,
        loadList,
        pendingPhotoFileName,
        photoFileInput,
        photoUploadError,
        previewPhotoSrc,
        schoolId,
        vehicleId,
        vehicleTitle,
        vehiclesListRoute,
    };
}
