<template>
    <UiCard aria-label="Card: Breadcrumbs (shadcn)" class="min-w-0">
        <UiCardHeader>
            <UiCardTitle class="text-base">Breadcrumbs (shadcn)</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-6">
            <div class="space-y-3">
                <p class="text-foreground text-sm font-semibold">Przykład</p>
                <UiBreadcrumb>
                    <UiBreadcrumbList>
                        <UiBreadcrumbItem>
                            <UiBreadcrumbLink :as-child="true">
                                <NuxtLink to="/"> Strona główna </NuxtLink>
                            </UiBreadcrumbLink>
                        </UiBreadcrumbItem>
                        <UiBreadcrumbSeparator />
                        <UiBreadcrumbItem>
                            <UiBreadcrumbLink :as-child="true">
                                <NuxtLink to="/design-system">
                                    Design system
                                </NuxtLink>
                            </UiBreadcrumbLink>
                        </UiBreadcrumbItem>
                        <UiBreadcrumbSeparator />
                        <UiBreadcrumbItem>
                            <UiBreadcrumbPage>Komponenty</UiBreadcrumbPage>
                        </UiBreadcrumbItem>
                    </UiBreadcrumbList>
                </UiBreadcrumb>
            </div>
        </UiCardContent>
    </UiCard>
</template>
