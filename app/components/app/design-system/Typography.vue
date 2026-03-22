<template>
    <section aria-label="Typography" class="space-y-4">
        <div
            class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        >
            <div class="space-y-1">
                <h2 class="text-xl font-bold tracking-tight">Typography</h2>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    Hierarchia nagłówków, akapitów, tekstu inline oraz elementów
                    pomocniczych.
                </p>
            </div>
        </div>

        <div class="space-y-8">
            <Card aria-label="Typography: Headings">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        Headings (h1–h6)
                    </p>
                </template>

                <div class="space-y-4">
                    <div class="space-y-1">
                        <h1
                            class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50"
                        >
                            Heading 1 — Display
                        </h1>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-4xl font-extrabold tracking-tight
                        </p>
                    </div>
                    <div class="space-y-1">
                        <h2
                            class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                        >
                            Heading 2 — Page title
                        </h2>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-3xl font-bold tracking-tight
                        </p>
                    </div>
                    <div class="space-y-1">
                        <h3
                            class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50"
                        >
                            Heading 3 — Section
                        </h3>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-2xl font-semibold tracking-tight
                        </p>
                    </div>
                    <div class="space-y-1">
                        <h4
                            class="text-xl font-semibold text-slate-900 dark:text-slate-50"
                        >
                            Heading 4 — Subsection
                        </h4>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-xl font-semibold
                        </p>
                    </div>
                    <div class="space-y-1">
                        <h5
                            class="text-lg font-medium text-slate-900 dark:text-slate-50"
                        >
                            Heading 5 — Card title
                        </h5>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-lg font-medium
                        </p>
                    </div>
                    <div class="space-y-1">
                        <h6
                            class="text-base font-medium text-slate-900 dark:text-slate-50"
                        >
                            Heading 6 — Small heading
                        </h6>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-base font-medium
                        </p>
                    </div>
                </div>
            </Card>

            <Card aria-label="Typography: Paragraphs">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        Paragraphs (p)
                    </p>
                </template>

                <div class="space-y-6">
                    <div class="space-y-1">
                        <p
                            class="text-lg leading-relaxed text-slate-700 dark:text-slate-300"
                        >
                            Lead paragraph — większy akapit wprowadzający.
                            Używaj do pierwszego akapitu w artykule lub sekcji.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-lg leading-relaxed
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-base leading-7 text-slate-700 dark:text-slate-300"
                        >
                            Base paragraph — standardowy tekst akapitowy. Lorem
                            ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore
                            magna aliqua.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-base leading-7
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-sm leading-6 text-slate-600 dark:text-slate-400"
                        >
                            Small paragraph — mniejszy tekst pomocniczy, opisy,
                            podpisy pod elementami.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-sm leading-6
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-xs leading-5 text-slate-500 dark:text-slate-400"
                        >
                            Extra small — etykiety, metadane, caption.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-xs leading-5
                        </p>
                    </div>
                </div>
            </Card>

            <Card aria-label="Typography: Inline text and spans">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        Inline text & spans
                    </p>
                </template>

                <div class="space-y-4">
                    <div class="space-y-1">
                        <p class="text-slate-700 dark:text-slate-300">
                            Tekst z
                            <span
                                class="font-semibold text-slate-900 dark:text-slate-50"
                                >pogrubieniem</span
                            >,
                            <span
                                class="text-slate-700 italic dark:text-slate-300"
                                >kursywą</span
                            >
                            oraz
                            <span
                                class="text-slate-700 underline decoration-sky-500 decoration-2 underline-offset-2 dark:text-slate-300"
                                >podkreśleniem</span
                            >.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            font-semibold, italic, underline
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-slate-700 dark:text-slate-300">
                            Tekst
                            <span class="text-slate-500 dark:text-slate-400"
                                >muted / secondary</span
                            >
                            oraz
                            <span
                                class="font-medium text-sky-600 dark:text-sky-400"
                                >link inline</span
                            >.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-slate-500, text-sky-600
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-slate-700 dark:text-slate-300">
                            <code
                                class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                >inline code</code
                            >
                            oraz
                            <kbd
                                class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50"
                                >kbd</kbd
                            >
                            (skrót klawiszowy).
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            code, kbd
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-slate-700 dark:text-slate-300">
                            <span
                                class="tracking-wider text-slate-600 uppercase dark:text-slate-400"
                                >Overline / label uppercase</span
                            >
                            — małe etykiety nad nagłówkami.
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            uppercase tracking-wider
                        </p>
                    </div>
                </div>
            </Card>

            <Card aria-label="Typography: Links, blockquote, lists">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        Links, blockquote & lists
                    </p>
                </template>

                <div class="space-y-6">
                    <div class="space-y-1">
                        <p class="text-slate-700 dark:text-slate-300">
                            <a
                                href="#"
                                class="font-medium text-sky-600 underline decoration-sky-500 underline-offset-2 hover:text-sky-500 hover:decoration-sky-400 dark:text-sky-400 dark:hover:text-sky-300"
                                aria-label="Przykładowy link"
                            >
                                Link podstawowy
                            </a>
                            —
                            <a
                                href="#"
                                class="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                                aria-label="Link bez podkreślenia"
                            >
                                link bez underline
                            </a>
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-sky-600 underline hover:text-sky-500
                        </p>
                    </div>
                    <div class="space-y-1">
                        <blockquote
                            class="border-l-4 border-sky-500 pl-4 text-slate-600 italic dark:border-sky-400 dark:text-slate-400"
                        >
                            Blockquote — cytat lub wyróżniony fragment tekstu.
                            Może zawierać wiele linii.
                        </blockquote>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            border-l-4 border-sky-500 pl-4 italic
                        </p>
                    </div>
                    <div class="space-y-1">
                        <ul
                            class="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300"
                        >
                            <li>Lista nieuporządkowana — element 1</li>
                            <li>Element 2</li>
                            <li>Element 3</li>
                        </ul>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            list-disc space-y-1 pl-5
                        </p>
                    </div>
                    <div class="space-y-1">
                        <ol
                            class="list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300"
                        >
                            <li>Lista uporządkowana — krok 1</li>
                            <li>Krok 2</li>
                            <li>Krok 3</li>
                        </ol>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            list-decimal space-y-1 pl-5
                        </p>
                    </div>
                </div>
            </Card>

            <Card aria-label="Typography: Labels and form text">
                <template #header>
                    <p
                        class="text-sm font-semibold text-slate-900 dark:text-slate-50"
                    >
                        Labels & form text
                    </p>
                </template>

                <div class="space-y-4">
                    <div class="space-y-1">
                        <label
                            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Label formularza (text-sm font-medium)
                        </label>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-sm font-medium
                        </p>
                    </div>
                    <div class="space-y-1">
                        <label
                            class="block text-xs font-medium tracking-wide text-slate-600 uppercase dark:text-slate-400"
                        >
                            Label uppercase (text-xs uppercase)
                        </label>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-xs font-medium uppercase tracking-wide
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs text-rose-500 dark:text-rose-400">
                            Tekst błędu walidacji
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-xs text-rose-500
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs text-slate-500 dark:text-slate-400">
                            Tekst pomocniczy pod polem (helper text)
                        </p>
                        <p
                            class="font-mono text-xs text-slate-500 dark:text-slate-400"
                        >
                            text-xs text-slate-500
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    </section>
</template>
