<script setup lang="ts">
import { z } from 'zod';

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
const shadcnSwitchDemo = ref(false);

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
    <UiCard aria-label="Card: Form controls (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Form controls (shadcn)</UiCardTitle>
            <UiCardDescription>
                Input, Radio, Checkbox, Textarea, Switch — komponenty z
                <code class="font-mono text-xs">app/components/shadcn</code>.
            </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <section aria-label="Input types preview" class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Input types</p>
                <form
                    class="grid min-w-0 gap-4 md:grid-cols-2"
                    aria-label="Input types demo form"
                    @submit.prevent
                >
                    <div class="space-y-2">
                        <UiLabel class="text-xs uppercase" for="inputTextDemo">
                            Text
                        </UiLabel>
                        <UiInput
                            id="inputTextDemo"
                            v-model="inputText"
                            type="text"
                            placeholder="Text input"
                            aria-label="Text input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <UiLabel class="text-xs uppercase" for="inputEmailDemo">
                            Email
                        </UiLabel>
                        <ClientOnly>
                            <UiInput
                                id="inputEmailDemo"
                                v-model="inputEmail"
                                type="email"
                                placeholder="name@example.com"
                                aria-label="Email input example"
                            />
                            <template #fallback>
                                <div
                                    class="border-input bg-background text-muted-foreground flex h-9 w-full items-center rounded-md border px-3 text-sm"
                                    aria-hidden="true"
                                >
                                    name@example.com
                                </div>
                            </template>
                        </ClientOnly>
                    </div>

                    <div class="space-y-2">
                        <UiLabel
                            class="text-xs uppercase"
                            for="inputPasswordDemo"
                        >
                            Password
                        </UiLabel>
                        <UiInput
                            id="inputPasswordDemo"
                            v-model="inputPassword"
                            type="password"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            aria-label="Password input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <UiLabel
                            class="text-xs uppercase"
                            for="inputNumberDemo"
                        >
                            Number
                        </UiLabel>
                        <UiInput
                            id="inputNumberDemo"
                            v-model="inputNumber"
                            type="number"
                            placeholder="123"
                            aria-label="Number input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <UiLabel class="text-xs uppercase" for="inputTelDemo">
                            Tel
                        </UiLabel>
                        <UiInput
                            id="inputTelDemo"
                            v-model="inputTel"
                            type="tel"
                            placeholder="+48 123 456 789"
                            aria-label="Telephone input example"
                        />
                    </div>

                    <div class="space-y-2">
                        <UiLabel class="text-xs uppercase" for="inputUrlDemo">
                            URL
                        </UiLabel>
                        <UiInput
                            id="inputUrlDemo"
                            v-model="inputUrl"
                            type="url"
                            placeholder="https://example.com"
                            aria-label="URL input example"
                        />
                    </div>

                    <div class="space-y-2 md:col-span-2">
                        <UiLabel
                            class="text-xs uppercase"
                            for="inputSearchDemo"
                        >
                            Search
                        </UiLabel>
                        <UiInput
                            id="inputSearchDemo"
                            v-model="inputSearch"
                            type="search"
                            placeholder="Search..."
                            aria-label="Search input example"
                        />
                    </div>
                </form>
            </section>

            <UiSeparator />

            <section aria-label="Shadcn Switch demo" class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Switch</p>
                <div class="flex flex-wrap items-center gap-3">
                    <UiSwitch
                        id="shadcnSwitchDemo"
                        v-model="shadcnSwitchDemo"
                        aria-label="Przełącznik demo"
                    />
                    <UiLabel
                        for="shadcnSwitchDemo"
                        class="cursor-pointer text-sm font-normal"
                    >
                        Powiadomienia (demo)
                    </UiLabel>
                </div>
            </section>

            <UiSeparator />

            <section
                aria-label="Radio and RadioGroup preview"
                class="space-y-4"
            >
                <p class="text-foreground text-sm font-semibold">
                    Radio & RadioGroup
                </p>
                <div class="grid min-w-0 gap-6 md:grid-cols-2">
                    <div class="min-w-0 space-y-2">
                        <p class="text-muted-foreground text-xs font-medium">
                            Delivery method (vertical)
                        </p>
                        <UiRadioGroup
                            v-model="formDeliveryMethod"
                            class="grid gap-3"
                            aria-label="Select delivery method"
                        >
                            <div class="flex items-center gap-3">
                                <UiRadioGroupItem
                                    id="dm-standard"
                                    value="standard"
                                />
                                <UiLabel for="dm-standard" class="font-normal">
                                    Standard (3–5 days)
                                </UiLabel>
                            </div>
                            <div class="flex items-center gap-3">
                                <UiRadioGroupItem
                                    id="dm-express"
                                    value="express"
                                />
                                <UiLabel for="dm-express" class="font-normal">
                                    Express (1–2 days)
                                </UiLabel>
                            </div>
                            <div class="flex items-center gap-3">
                                <UiRadioGroupItem
                                    id="dm-pickup"
                                    value="pickup"
                                />
                                <UiLabel for="dm-pickup" class="font-normal">
                                    Store pickup
                                </UiLabel>
                            </div>
                        </UiRadioGroup>
                    </div>
                    <div class="min-w-0 space-y-2">
                        <p class="text-muted-foreground text-xs font-medium">
                            Notification (horizontal)
                        </p>
                        <UiRadioGroup
                            v-model="formNotificationPref"
                            class="flex flex-row flex-wrap gap-4"
                            aria-label="Select notification preference"
                        >
                            <div class="flex items-center gap-2">
                                <UiRadioGroupItem id="np-email" value="email" />
                                <UiLabel for="np-email" class="font-normal">
                                    Email
                                </UiLabel>
                            </div>
                            <div class="flex items-center gap-2">
                                <UiRadioGroupItem id="np-sms" value="sms" />
                                <UiLabel for="np-sms" class="font-normal">
                                    SMS
                                </UiLabel>
                            </div>
                            <div class="flex items-center gap-2">
                                <UiRadioGroupItem
                                    id="np-none"
                                    value="none"
                                    disabled
                                />
                                <UiLabel
                                    for="np-none"
                                    class="font-normal opacity-60"
                                >
                                    None (disabled)
                                </UiLabel>
                            </div>
                        </UiRadioGroup>
                    </div>
                </div>
            </section>

            <UiSeparator />

            <section
                aria-label="Select, textarea and checkbox preview"
                class="space-y-4"
            >
                <p class="text-foreground text-sm font-semibold">
                    Select, textarea & checkbox
                </p>

                <form
                    class="space-y-4"
                    aria-label="Sample form controls preview"
                    @submit.prevent="handleSubmitFormControls"
                >
                    <div class="space-y-2">
                        <UiLabel for="formNameInput">Name</UiLabel>
                        <UiInput
                            id="formNameInput"
                            v-model="formName"
                            type="text"
                            placeholder="e.g. John Doe"
                            aria-label="Enter name"
                        />
                        <p
                            v-if="formControlsErrors.name"
                            class="text-destructive text-xs"
                        >
                            {{ formControlsErrors.name }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="formEmailInput">Email</UiLabel>
                        <UiInput
                            id="formEmailInput"
                            v-model="formEmail"
                            type="email"
                            placeholder="e.g. john@example.com"
                            aria-label="Enter email"
                        />
                        <p
                            v-if="formControlsErrors.email"
                            class="text-destructive text-xs"
                        >
                            {{ formControlsErrors.email }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="formTopicSelect">Topic (select)</UiLabel>
                        <select
                            id="formTopicSelect"
                            v-model="formTopic"
                            class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Select topic"
                        >
                            <option value="general">General question</option>
                            <option value="support">Support</option>
                            <option value="feedback">Feedback</option>
                        </select>
                        <p
                            v-if="formControlsErrors.topic"
                            class="text-destructive text-xs"
                        >
                            {{ formControlsErrors.topic }}
                        </p>
                    </div>

                    <div class="space-y-2">
                        <UiLabel for="formMessageTextarea">
                            Message (textarea)
                        </UiLabel>
                        <UiTextarea
                            id="formMessageTextarea"
                            v-model="formMessage"
                            rows="4"
                            placeholder="Write your message..."
                            aria-label="Enter message"
                        />
                        <p
                            v-if="formControlsErrors.message"
                            class="text-destructive text-xs"
                        >
                            {{ formControlsErrors.message }}
                        </p>
                    </div>

                    <div class="flex items-start gap-3">
                        <UiCheckbox
                            id="formConsentCheckbox"
                            v-model="formIsConsented"
                            aria-label="Accept terms and privacy policy"
                        />
                        <UiLabel
                            for="formConsentCheckbox"
                            class="text-sm leading-relaxed font-normal"
                        >
                            I accept the terms and privacy policy.
                        </UiLabel>
                    </div>

                    <p
                        v-if="formControlsErrors.isConsented"
                        class="text-destructive text-xs"
                    >
                        {{ formControlsErrors.isConsented }}
                    </p>

                    <div
                        class="flex flex-wrap items-center gap-2 gap-y-1 sm:gap-3"
                    >
                        <UiButton
                            type="submit"
                            aria-label="Submit form preview"
                            :disabled="!isFormControlsValid"
                        >
                            Submit
                        </UiButton>
                        <p class="text-muted-foreground text-xs">
                            This is only a preview – data is not sent.
                        </p>
                    </div>
                </form>
            </section>
        </UiCardContent>
    </UiCard>
</template>
