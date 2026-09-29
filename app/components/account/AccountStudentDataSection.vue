<script setup lang="ts">
import { IdCard } from 'lucide-vue-next';

defineProps<{
    accountPkkNumber: string;
    isAccountPkkMissing: boolean;
}>();
</script>

<template>
    <section aria-labelledby="account-student-data-heading">
        <div class="mb-2 flex items-center gap-2">
            <IdCard class="text-muted-foreground size-4" aria-hidden="true" />
            <h3
                id="account-student-data-heading"
                class="text-foreground text-sm font-semibold"
            >
                Dane kursanta
            </h3>
        </div>
        <dl>
            <div class="flex min-w-0 items-start justify-between gap-4 py-2">
                <dt class="text-muted-foreground text-sm">Numer PKK</dt>
                <dd
                    class="min-w-0 text-right text-sm font-semibold break-words"
                    :class="
                        isAccountPkkMissing
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                    "
                >
                    {{ accountPkkNumber }}
                </dd>
            </div>
        </dl>
    </section>
</template>
