<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { InstructorEditFormModel } from '~/types/instructor';

const open = defineModel<boolean>('open', { required: true });
const form = defineModel<InstructorEditFormModel | null>('form', {
    required: true,
});

defineProps<{
    isSubmitting: boolean;
    submitError: string | null;
}>();

const emit = defineEmits<{
    submit: [];
}>();

const DESCRIPTION_ID = 'instructor-edit-dialog-desc';

function handleCancel(): void {
    open.value = false;
}

function handleFormSubmit(): void {
    emit('submit');
}

function handleExperienceYearsInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const t = el.value.trim();
    const f = form.value;

    if (!f) {
        return;
    }

    if (t === '') {
        f.experienceYears = 0;

        return;
    }

    const n = Number.parseInt(t, 10);

    f.experienceYears = Number.isNaN(n) ? 0 : n;
}

const fieldClass =
    'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
</script>

<template>
    <UiDialog v-model:open="open">
        <UiDialogContent
            :show-close-button="!isSubmitting"
            :close-on-outside-click="false"
            :aria-describedby="DESCRIPTION_ID"
            class="max-h-[90vh] max-w-lg overflow-y-auto"
        >
            <UiDialogHeader>
                <UiDialogTitle>Edycja instruktora</UiDialogTitle>
                <UiDialogDescription :id="DESCRIPTION_ID">
                    Zmiany zapisują się przez
                    <span class="font-mono">PATCH /api/instructors/:id</span>.
                    E‑mail jest tylko do odczytu. Kliknięcie poza oknem nie
                    zamyka formularza.
                </UiDialogDescription>
            </UiDialogHeader>

            <form
                v-if="form"
                class="space-y-4"
                aria-label="Edycja danych instruktora"
                :aria-busy="isSubmitting"
                @submit.prevent="handleFormSubmit"
            >
                <p
                    v-if="isSubmitting"
                    class="text-muted-foreground text-sm"
                    role="status"
                    aria-live="polite"
                >
                    Zapisywanie zmian…
                </p>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div class="space-y-2">
                        <label
                            class="text-sm leading-none font-medium"
                            for="instructor-edit-first-name"
                        >
                            Imię
                        </label>
                        <input
                            id="instructor-edit-first-name"
                            v-model="form.firstName"
                            type="text"
                            name="firstName"
                            autocomplete="given-name"
                            required
                            :disabled="isSubmitting"
                            :class="fieldClass"
                        />
                    </div>
                    <div class="space-y-2">
                        <label
                            class="text-sm leading-none font-medium"
                            for="instructor-edit-last-name"
                        >
                            Nazwisko
                        </label>
                        <input
                            id="instructor-edit-last-name"
                            v-model="form.lastName"
                            type="text"
                            name="lastName"
                            autocomplete="family-name"
                            required
                            :disabled="isSubmitting"
                            :class="fieldClass"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="instructor-edit-email"
                    >
                        E‑mail
                    </label>
                    <input
                        id="instructor-edit-email"
                        :value="form.email"
                        type="email"
                        name="email"
                        readonly
                        tabindex="-1"
                        aria-readonly="true"
                        :disabled="isSubmitting"
                        :class="
                            cn(
                                fieldClass,
                                'bg-muted text-muted-foreground cursor-not-allowed',
                            )
                        "
                    />
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="instructor-edit-experience-years"
                    >
                        Staż (lata)
                    </label>
                    <input
                        id="instructor-edit-experience-years"
                        type="number"
                        name="experienceYears"
                        min="0"
                        max="80"
                        step="1"
                        :value="form.experienceYears"
                        :disabled="isSubmitting"
                        :class="fieldClass"
                        aria-describedby="instructor-edit-experience-hint"
                        @input="handleExperienceYearsInput"
                    />
                    <p
                        id="instructor-edit-experience-hint"
                        class="text-muted-foreground text-xs"
                    >
                        Liczba całkowita od 0 do 80.
                    </p>
                </div>

                <div class="space-y-2">
                    <label
                        class="text-sm leading-none font-medium"
                        for="instructor-edit-qualifications"
                    >
                        Kwalifikacje
                    </label>
                    <textarea
                        id="instructor-edit-qualifications"
                        v-model="form.qualifications"
                        name="qualifications"
                        rows="4"
                        :disabled="isSubmitting"
                        class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full resize-y rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>

                <p
                    v-if="submitError"
                    class="text-destructive text-sm"
                    role="alert"
                    aria-live="polite"
                >
                    {{ submitError }}
                </p>

                <UiDialogFooter class="gap-2 sm:gap-2">
                    <button
                        type="button"
                        class="border-input bg-background text-foreground focus-visible:ring-ring hover:bg-muted inline-flex rounded-md border px-3 py-2 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        :disabled="isSubmitting"
                        @click="handleCancel"
                    >
                        Anuluj
                    </button>
                    <button
                        type="submit"
                        class="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex rounded-md px-3 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                        :disabled="isSubmitting"
                        :aria-busy="isSubmitting"
                    >
                        {{ isSubmitting ? 'Zapisywanie…' : 'Zapisz' }}
                    </button>
                </UiDialogFooter>
            </form>
        </UiDialogContent>
    </UiDialog>
</template>
