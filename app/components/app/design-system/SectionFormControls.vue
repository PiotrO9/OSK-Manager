<script setup lang="ts">
import { z } from 'zod';

const { t } = useI18n();
const { addToast } = useAppToast();

const formName = ref('');
const formEmail = ref('');
const formMessage = ref('');
const formTopic = ref<'general' | 'support' | 'feedback'>('general');
const formIsConsented = ref(false);

const inputText = ref('');
const inputEmail = ref('');
const inputPassword = ref('');
const inputNumber = ref('');
const inputTel = ref('');
const inputUrl = ref('');
const inputSearch = ref('');

const formDeliveryMethod = ref<'standard' | 'express' | 'pickup'>('standard');
const formNotificationPref = ref<'email' | 'sms' | 'none'>('email');

function createFormControlsSchema() {
    return z.object({
        name: z.string().trim().min(1, 'Nazwa jest wymagana'),
        email: z
            .string()
            .trim()
            .min(1, 'Email jest wymagany')
            .email('Nieprawidłowy email'),
        topic: z.enum(['general', 'support', 'feedback']),
        message: z.string().trim().min(1, 'Wiadomość jest wymagana'),
        isConsented: z.boolean().refine((value) => value === true, {
            message: 'Musisz zaakceptować warunki',
        }),
    });
}

const formControlsSchema = computed(createFormControlsSchema);

type FormControlsData = z.infer<ReturnType<typeof createFormControlsSchema>>;
type FormControlsErrors = Partial<Record<keyof FormControlsData, string>>;

const formControlsErrors = ref<FormControlsErrors>({});

const formControlsData = computed<FormControlsData>(() => ({
    name: formName.value,
    email: formEmail.value,
    topic: formTopic.value,
    message: formMessage.value,
    isConsented: formIsConsented.value,
}));

const isFormControlsValid = computed(() => {
    const result = formControlsSchema.value.safeParse(formControlsData.value);

    return result.success;
});

function resetFormControlsErrors() {
    formControlsErrors.value = {};
}

function setFormControlsErrorsFromZod(
    result: z.ZodSafeParseError<FormControlsData>,
) {
    resetFormControlsErrors();

    for (const issue of result.error.issues) {
        const fieldKey = issue.path[0];

        if (typeof fieldKey !== 'string') {
            continue;
        }

        const key = fieldKey as keyof FormControlsData;

        if (!formControlsErrors.value[key]) {
            formControlsErrors.value[key] = issue.message;
        }
    }
}

function handleSubmitFormControls(event?: Event) {
    if (event) {
        event.preventDefault();
    }

    const result = formControlsSchema.value.safeParse(formControlsData.value);

    if (!result.success) {
        setFormControlsErrorsFromZod(result);

        addToast({
            title: 'Formularz jest nieprawidłowy',
            description: 'Proszę sprawdzić dane i spróbować ponownie.',
            variant: 'warning',
        });

        return;
    }

    resetFormControlsErrors();

    addToast({
        title: 'Formularz został wysłany',
        description: `Dziękujemy, ${result.data.name}!`,
        variant: 'success',
    });
}
</script>

<template>
    <Card aria-label="Card: Form controls">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Form controls
            </p>
        </template>

        <div class="space-y-6">
            <section aria-label="Input types preview" class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Input types
                </p>
                <form
                    class="grid min-w-0 gap-4 md:grid-cols-2"
                    aria-label="Input types demo form"
                    @submit.prevent
                >
                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputTextDemo"
                        >
                            Text
                        </label>
                        <ClientOnly>
                            <Input
                                id="inputTextDemo"
                                v-model="inputText"
                                type="text"
                                placeholder="Text input"
                                aria-label="Text input example"
                            />
                        </ClientOnly>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputEmailDemo"
                        >
                            Email
                        </label>
                        <ClientOnly>
                            <Input
                                id="inputEmailDemo"
                                v-model="inputEmail"
                                type="email"
                                placeholder="name@example.com"
                                aria-label="Email input example"
                            />
                            <template #fallback>
                                <div
                                    class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                                    aria-hidden="true"
                                >
                                    name@example.com
                                </div>
                            </template>
                        </ClientOnly>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputPasswordDemo"
                        >
                            Password
                        </label>
                        <ClientOnly>
                            <Input
                                id="inputPasswordDemo"
                                v-model="inputPassword"
                                type="password"
                                autocomplete="current-password"
                                placeholder="••••••••"
                                aria-label="Password input example"
                            />
                        </ClientOnly>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputNumberDemo"
                        >
                            Number
                        </label>
                        <Input
                            id="inputNumberDemo"
                            v-model="inputNumber"
                            type="number"
                            placeholder="123"
                            aria-label="Number input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputTelDemo"
                        >
                            Tel
                        </label>
                        <Input
                            id="inputTelDemo"
                            v-model="inputTel"
                            type="tel"
                            placeholder="+48 123 456 789"
                            aria-label="Telephone input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputUrlDemo"
                        >
                            URL
                        </label>
                        <Input
                            id="inputUrlDemo"
                            v-model="inputUrl"
                            type="url"
                            placeholder="https://example.com"
                            aria-label="URL input example"
                        />
                    </div>

                    <div class="space-y-2 md:col-span-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                            for="inputSearchDemo"
                        >
                            Search
                        </label>
                        <Input
                            id="inputSearchDemo"
                            v-model="inputSearch"
                            type="search"
                            placeholder="Search..."
                            aria-label="Search input example"
                        />
                    </div>
                </form>
            </section>

            <section
                aria-label="Radio and RadioGroup preview"
                class="space-y-4"
            >
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Radio & RadioGroup
                </p>
                <div class="grid min-w-0 gap-6 md:grid-cols-2">
                    <div class="min-w-0 space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                        >
                            Delivery method (RadioGroup)
                        </label>
                        <RadioGroup
                            v-model="formDeliveryMethod"
                            aria-label="Select delivery method"
                            orientation="vertical"
                        >
                            <Radio
                                value="standard"
                                aria-label="Standard delivery"
                            >
                                Standard (3–5 days)
                            </Radio>
                            <Radio
                                value="express"
                                aria-label="Express delivery"
                            >
                                Express (1–2 days)
                            </Radio>
                            <Radio value="pickup" aria-label="Store pickup">
                                Store pickup
                            </Radio>
                        </RadioGroup>
                    </div>
                    <div class="min-w-0 space-y-2">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                        >
                            Notification preference (horizontal)
                        </label>
                        <RadioGroup
                            v-model="formNotificationPref"
                            aria-label="Select notification preference"
                            orientation="horizontal"
                        >
                            <Radio
                                value="email"
                                aria-label="Email notifications"
                            >
                                Email
                            </Radio>
                            <Radio value="sms" aria-label="SMS notifications">
                                SMS
                            </Radio>
                            <Radio
                                value="none"
                                aria-label="No notifications"
                                :is-disabled="true"
                            >
                                None (disabled)
                            </Radio>
                        </RadioGroup>
                    </div>
                </div>
            </section>

            <section
                aria-label="Select, textarea and checkbox preview"
                class="space-y-4"
            >
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Select, textarea & checkbox
                </p>

                <form
                    class="space-y-4"
                    aria-label="Sample form controls preview"
                    @submit.prevent="handleSubmitFormControls"
                >
                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="formNameInput"
                        >
                            Name
                        </label>
                        <Input
                            id="formNameInput"
                            v-model="formName"
                            type="text"
                            placeholder="e.g. John Doe"
                            aria-label="Enter name"
                        />
                        <p
                            v-if="formControlsErrors.name"
                            class="text-xs text-rose-500 dark:text-rose-400"
                        >
                            {{ formControlsErrors.name }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="formEmailInput"
                        >
                            Email
                        </label>
                        <Input
                            id="formEmailInput"
                            v-model="formEmail"
                            type="email"
                            placeholder="e.g. john@example.com"
                            aria-label="Enter email"
                        />
                        <p
                            v-if="formControlsErrors.email"
                            class="text-xs text-rose-500 dark:text-rose-400"
                        >
                            {{ formControlsErrors.email }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="formTopicSelect"
                        >
                            Topic (select)
                        </label>
                        <select
                            id="formTopicSelect"
                            v-model="formTopic"
                            class="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:ring-offset-slate-950"
                            aria-label="Select topic"
                        >
                            <option value="general">General question</option>
                            <option value="support">Support</option>
                            <option value="feedback">Feedback</option>
                        </select>
                        <p
                            v-if="formControlsErrors.topic"
                            class="text-xs text-rose-500 dark:text-rose-400"
                        >
                            {{ formControlsErrors.topic }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                            for="formMessageTextarea"
                        >
                            Message (textarea)
                        </label>
                        <textarea
                            id="formMessageTextarea"
                            v-model="formMessage"
                            rows="4"
                            class="block w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:ring-offset-slate-950"
                            placeholder="Write your message..."
                            aria-label="Enter message"
                        />
                        <p
                            v-if="formControlsErrors.message"
                            class="text-xs text-rose-500 dark:text-rose-400"
                        >
                            {{ formControlsErrors.message }}
                        </p>
                    </div>

                    <div class="flex items-start gap-2">
                        <label
                            class="inline-flex cursor-pointer items-start gap-2"
                            for="formConsentCheckbox"
                        >
                            <input
                                id="formConsentCheckbox"
                                v-model="formIsConsented"
                                type="checkbox"
                                class="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 shadow-sm focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:ring-offset-slate-950"
                                aria-label="Accept terms and privacy policy"
                            />
                            <span
                                class="text-sm text-slate-700 dark:text-slate-300"
                            >
                                I accept the terms and privacy policy.
                            </span>
                        </label>
                    </div>

                    <p
                        v-if="formControlsErrors.isConsented"
                        class="text-xs text-rose-500 dark:text-rose-400"
                    >
                        {{ formControlsErrors.isConsented }}
                    </p>

                    <div
                        class="flex flex-wrap items-center gap-2 gap-y-1 sm:gap-3"
                    >
                        <Action
                            type="submit"
                            aria-label="Submit form preview"
                            :is-disabled="!isFormControlsValid"
                        >
                            Submit
                        </Action>
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            This is only a preview – data is not sent.
                        </p>
                    </div>
                </form>
            </section>
        </div>
    </Card>
</template>
