<script setup lang="ts">
const { addToast } = useAppToast();

function handleToast(variant: ToastVariant) {
    addToast({
        title:
            variant === 'success'
                ? 'Success'
                : variant === 'warning'
                  ? 'Warning'
                  : variant === 'error'
                    ? 'Error'
                    : 'Info',
        description: 'Sample toast message.',
        variant,
    });
}
</script>

<template>
    <Card aria-label="Card: Actions">
        <template #header>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Actions
            </p>
        </template>

        <div class="space-y-6">
            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Primary
                </p>
                <div class="flex flex-wrap gap-3">
                    <Action aria-label="Primary normal">Normal</Action>
                    <Action aria-label="Primary loading" :is-loading="true">
                        Submit
                    </Action>
                    <Action aria-label="Primary disabled" :is-disabled="true">
                        Disabled
                    </Action>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Secondary
                </p>
                <div class="flex flex-wrap gap-3">
                    <Action aria-label="Secondary normal" variant="secondary">
                        Normal
                    </Action>
                    <Action
                        aria-label="Secondary loading"
                        variant="secondary"
                        :is-loading="true"
                    >
                        Save
                    </Action>
                    <Action
                        aria-label="Secondary disabled"
                        variant="secondary"
                        :is-disabled="true"
                    >
                        Disabled
                    </Action>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Circle
                </p>
                <div class="flex flex-wrap items-center gap-3">
                    <Action aria-label="Circle primary" :circle="true">
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </Action>
                    <Action
                        aria-label="Circle secondary"
                        variant="secondary"
                        :circle="true"
                    >
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </Action>
                    <Action
                        aria-label="Circle loading"
                        :circle="true"
                        :is-loading="true"
                    >
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </Action>
                    <Action
                        aria-label="Circle disabled"
                        :circle="true"
                        :is-disabled="true"
                    >
                        <Icon
                            name="heroicons:plus"
                            class="size-5"
                            aria-hidden="true"
                        />
                    </Action>
                    <Action aria-label="Circle z tekstem" :circle="true">
                        A
                    </Action>
                    <Action
                        aria-label="Circle z emoji"
                        variant="secondary"
                        :circle="true"
                    >
                        ❤️
                    </Action>
                </div>
            </div>

            <div class="space-y-3">
                <p
                    class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                >
                    Different tags
                </p>
                <div class="flex flex-wrap gap-3">
                    <Action aria-label="Action as button" tag="button">
                        Button
                    </Action>
                    <Action
                        aria-label="Action as link"
                        tag="a"
                        href="#"
                        variant="secondary"
                    >
                        Link
                    </Action>
                    <Action
                        aria-label="Action as div"
                        tag="div"
                        variant="secondary"
                    >
                        Div
                    </Action>
                </div>
            </div>
        </div>
    </Card>
</template>
