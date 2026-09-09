<template>
    <div class="poster-art">
        <div class="poster-copy">
            <h2 class="poster-title" aria-label="Plan jazd pod pełną kontrolą">
                <span class="title-line">Plan jazd</span>
                <span class="title-line">pod pełną</span>
                <span class="title-line title-accent">kontrolą</span>
            </h2>
        </div>
        <svg
            class="poster-road"
            viewBox="0 0 600 660"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <pattern
                    id="poster-grid"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx="1" cy="1" r="1" fill="#a4daf1" opacity=".16" />
                </pattern>
            </defs>
            <path fill="url(#poster-grid)" d="M0 0h600v660H0z" />
            <circle cx="458" cy="174" r="89" fill="#90dafa" />
            <circle
                cx="458"
                cy="174"
                r="68"
                stroke="#102f40"
                stroke-width=".8"
                opacity=".3"
            />
            <path
                d="M370 -100V150c0 126 182 77 182 213 0 115-248 101-248 221v176"
                stroke="#68c9f4"
                stroke-width="106"
            />
            <path
                d="M370 -100V150c0 126 182 77 182 213 0 115-248 101-248 221v176"
                stroke="#113447"
                stroke-width="71"
            />
            <path
                d="M370 -100V150c0 126 182 77 182 213 0 115-248 101-248 221v176"
                stroke="#c4efff"
                stroke-width="2"
                stroke-dasharray="12 13"
            />
            <path
                d="m365 117 5 8 5-8M421 455l-10 2 6 8"
                stroke="#e7f8ff"
                stroke-width="2"
            />
            <g transform="translate(535 335) rotate(10)">
                <rect width="21" height="39" rx="7" fill="#f4fafc" />
                <path d="M3 12h15M3 27h15" stroke="#234d61" stroke-width="5" />
                <rect x="4" y="1" width="13" height="3" rx="1" fill="#73ccef" />
            </g>
            <circle cx="304" cy="608" r="6" fill="#bdeeff" />
            <circle
                cx="304"
                cy="608"
                r="13"
                stroke="#bdeeff"
                stroke-opacity=".35"
            />
        </svg>
    </div>
</template>

<style scoped>
.poster-art {
    position: static;
    flex: 1;
    min-height: 474px;
}
.poster-copy {
    position: relative;
    z-index: 1;
    padding-top: 96px;
}
.poster-title {
    font-size: clamp(50px, 5vw, 68px);
    font-weight: 800;
    line-height: 1.14;
    letter-spacing: -2px;
}
.title-line {
    display: block;
}
.poster-title .title-accent {
    color: #8adaff;
}
.poster-road {
    position: absolute;
    width: 600px;
    height: 660px;
    max-width: none;
    top: 0;
    right: -44px;
    pointer-events: none;
}
@media (max-width: 1100px) and (min-width: 761px) {
    .poster-road {
        right: -130px;
    }
    .poster-title {
        font-size: 50px;
    }
}
@media (max-width: 900px) {
    .poster-art {
        min-height: 166px;
    }
    .poster-copy {
        padding-top: 22px;
    }
    .poster-title {
        font-size: 34px;
        letter-spacing: -1.4px;
    }
    .poster-road {
        width: 380px;
        height: 418px;
        top: -71px;
        right: -79px;
        opacity: 0.85;
    }
}
@media (max-width: 380px) {
    .poster-road {
        right: -120px;
        opacity: 0.65;
    }
}
</style>
