<template>
    <UiCard aria-label="Card: Breadcrumbs (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Breadcrumbs (shadcn)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Przyklad</p>
                <UiBreadcrumb>
                    <UiBreadcrumbList>
                        <UiBreadcrumbItem>
                            <UiBreadcrumbLink
                                :as-child="true"
                                class="text-primary hover:text-primary-700 font-medium"
                            >
                                <NuxtLink to="/">Strona glowna</NuxtLink>
                            </UiBreadcrumbLink>
                        </UiBreadcrumbItem>
                        <UiBreadcrumbSeparator class="text-primary/40" />
                        <UiBreadcrumbItem>
                            <UiBreadcrumbLink
                                :as-child="true"
                                class="text-primary hover:text-primary-700 font-medium"
                            >
                                <NuxtLink to="/design-system">
                                    Design system
                                </NuxtLink>
                            </UiBreadcrumbLink>
                        </UiBreadcrumbItem>
                        <UiBreadcrumbSeparator class="text-primary/40" />
                        <UiBreadcrumbItem>
                            <UiBreadcrumbPage
                                class="text-primary-800 font-semibold"
                            >
                                Komponenty
                            </UiBreadcrumbPage>
                        </UiBreadcrumbItem>
                    </UiBreadcrumbList>
                </UiBreadcrumb>
            </div>
        </UiCardContent>
    </UiCard>
</template>
