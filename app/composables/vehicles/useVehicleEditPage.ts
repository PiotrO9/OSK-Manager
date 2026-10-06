import type {
    VehicleDetail,
    VehicleWritePayload,
} from '~/types/vehicles/vehicle';
import {
    isVehicleRegistrationConflict,
    validateVehiclePhotoFile,
} from '~/utils/vehicles/vehicleForm';

export const VEHICLE_EDIT_FORM_ID = 'vehicle-edit-form';

function formatPhotoFileSize(size: number): string {
    const formatter = new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 1,
    });

    if (size >= 1024 * 1024) {
        return `${formatter.format(size / (1024 * 1024))} MB`;
    }

    return `${formatter.format(Math.max(1, size / 1024))} kB`;
}

export function useVehicleEditPage() {
    const route = useRoute();
    const {
        fetchVehicleById,
        updateVehicle,
        uploadVehiclePhoto,
        isUpdateLoading,
        isPhotoUploadLoading,
    } = useVehiclesApi();
    const { addToast } = useAppToast();

    const vehicleId = computed(() => {
        const raw = route.params.id;
        const s = Array.isArray(raw) ? raw[0] : raw;

        if (typeof s !== 'string') return null;

        const t = s.trim();

        return t.length > 0 ? t : null;
    });

    const vehicleDetail = ref<VehicleDetail | null>(null);
    const loadError = ref<string | null>(null);
    const isDetailLoading = ref(false);
    const apiError = ref<string | null>(null);
    const registrationNumberError = ref<string | null>(null);
    const photoFileInput = ref<HTMLInputElement | null>(null);
    const photoUploadError = ref<string | null>(null);
    const pendingPhotoFile = ref<File | null>(null);
    const pendingPhotoObjectUrl = ref<string | null>(null);
    const isSaveNavigationAllowed = ref(false);
    let detailLoadSeq = 0;

    const initialVehicle = computed(() => vehicleDetail.value);

    const vehicleTitle = computed(() => {
        const name = initialVehicle.value?.name.trim();

        return name && name.length > 0 ? name : 'Edytuj pojazd';
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
    const pendingPhotoFileSize = computed(() =>
        pendingPhotoFile.value
            ? formatPhotoFileSize(pendingPhotoFile.value.size)
            : null,
    );
    const hasPendingPhoto = computed(() => pendingPhotoFile.value !== null);
    const canRetryPhotoUpload = computed(
        () => hasPendingPhoto.value && photoUploadError.value !== null,
    );
    const isSaveBusy = computed(
        () => isUpdateLoading.value || isPhotoUploadLoading.value,
    );

    const vehiclesListRoute = '/vehicles';

    function revokePendingPhotoPreview() {
        if (pendingPhotoObjectUrl.value) {
            URL.revokeObjectURL(pendingPhotoObjectUrl.value);
            pendingPhotoObjectUrl.value = null;
        }
    }

    function clearPendingPhoto(clearError = true): void {
        revokePendingPhotoPreview();
        pendingPhotoFile.value = null;

        if (photoFileInput.value) {
            photoFileInput.value.value = '';
        }

        if (clearError) {
            photoUploadError.value = null;
        }
    }

    function clearRegistrationNumberError(): void {
        registrationNumberError.value = null;
    }

    async function loadVehicleDetail() {
        const id = vehicleId.value;
        const seq = ++detailLoadSeq;

        if (!id) {
            vehicleDetail.value = null;

            return;
        }

        isDetailLoading.value = true;
        loadError.value = null;

        try {
            const detail = await fetchVehicleById(id);

            if (seq !== detailLoadSeq) return;

            vehicleDetail.value = detail;
        } catch (err) {
            if (seq !== detailLoadSeq) return;

            loadError.value =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się wczytać pojazdu.';
            vehicleDetail.value = null;
        } finally {
            if (seq === detailLoadSeq) {
                isDetailLoading.value = false;
            }
        }
    }

    function handlePhotoFileInputChange(event: Event) {
        const input =
            event.target instanceof HTMLInputElement ? event.target : null;
        const file = input?.files?.[0] ?? null;

        clearPendingPhoto();

        if (!input) return;

        photoFileInput.value = input;
        input.value = '';

        if (!file) return;

        const validationError = validateVehiclePhotoFile(file);

        if (validationError) {
            photoUploadError.value = validationError;

            return;
        }

        pendingPhotoFile.value = file;
        pendingPhotoObjectUrl.value = URL.createObjectURL(file);
    }

    async function uploadPendingPhoto(id: string): Promise<boolean> {
        const file = pendingPhotoFile.value;

        if (!file) return true;

        try {
            const photoUrl = await uploadVehiclePhoto(id, file);

            if (vehicleDetail.value) {
                vehicleDetail.value = {
                    ...vehicleDetail.value,
                    photoUrl,
                };
            }

            clearPendingPhoto();

            return true;
        } catch (err) {
            const reason =
                err instanceof Error && err.message.trim().length > 0
                    ? ` ${err.message.trim()}`
                    : '';

            photoUploadError.value =
                `Dane pojazdu zostały zapisane, ale nie udało się przesłać zdjęcia.${reason}`.trim();

            return false;
        }
    }

    async function navigateToListAfterSave(message: string) {
        isSaveNavigationAllowed.value = true;
        addToast({ title: message, variant: 'success' });

        await navigateTo('/vehicles');
    }

    async function handleVehicleSubmit(payload: VehicleWritePayload) {
        const id = vehicleId.value;

        if (!id || isSaveBusy.value) return;

        apiError.value = null;
        registrationNumberError.value = null;
        photoUploadError.value = null;

        try {
            const updatedVehicle = await updateVehicle(id, payload);

            vehicleDetail.value = {
                ...updatedVehicle,
                photoUrl: vehicleDetail.value?.photoUrl ?? null,
            };

            const photoUploaded = await uploadPendingPhoto(id);

            if (!photoUploaded) {
                addToast({
                    title: 'Dane pojazdu zostały zapisane',
                    description:
                        'Zdjęcie nie zostało przesłane. Możesz spróbować ponownie.',
                    variant: 'error',
                });

                return;
            }

            await navigateToListAfterSave('Zmiany pojazdu zostały zapisane');
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Nie udało się zapisać pojazdu.';

            if (isVehicleRegistrationConflict(message)) {
                registrationNumberError.value =
                    'Pojazd z tym numerem rejestracyjnym już istnieje w tej szkole.';

                return;
            }

            apiError.value = message;
        }
    }

    async function retryPhotoUpload() {
        const id = vehicleId.value;

        if (!id || !pendingPhotoFile.value) return;

        photoUploadError.value = null;

        const uploaded = await uploadPendingPhoto(id);

        if (uploaded) {
            await navigateToListAfterSave('Zdjęcie pojazdu zostało przesłane');
        }
    }

    watch(
        vehicleId,
        () => {
            isSaveNavigationAllowed.value = false;
            apiError.value = null;
            registrationNumberError.value = null;
            clearPendingPhoto();
            void loadVehicleDetail();
        },
        { immediate: true },
    );

    onUnmounted(() => {
        detailLoadSeq += 1;
        revokePendingPhotoPreview();
    });

    return {
        apiError,
        canRetryPhotoUpload,
        clearPendingPhoto,
        clearRegistrationNumberError,
        formId: VEHICLE_EDIT_FORM_ID,
        handlePhotoFileInputChange,
        handleVehicleSubmit,
        hasPendingPhoto,
        initialVehicle,
        isDetailLoading,
        isSaveBusy,
        isSaveNavigationAllowed,
        loadError,
        loadVehicleDetail,
        pendingPhotoFileName,
        pendingPhotoFileSize,
        photoUploadError,
        previewPhotoSrc,
        registrationNumberError,
        retryPhotoUpload,
        vehicleId,
        vehicleTitle,
        vehiclesListRoute,
    };
}
