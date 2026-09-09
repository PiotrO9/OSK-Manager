<script setup lang="ts">
import {
    BookOpen,
    Building2,
    CalendarDays,
    CalendarClock,
    CarFront,
    CreditCard,
    MessageSquareText,
    Route,
    Users,
} from 'lucide-vue-next';
</script>

<template>
    <aside
        class="login-story"
        aria-label="OSK Manager — zarządzanie szkołą jazdy"
    >
        <div class="story-brand">
            <span class="brand-mark"
                ><Route :size="25" aria-hidden="true"
            /></span>
            <span class="brand-name">OSK<span>Manager</span></span>
        </div>
        <div class="story-intro">
            <p class="story-eyebrow">
                <span /> PULPIT, GRAFIK, KURSY I PŁATNOŚCI
            </p>
            <h2 class="story-title">
                <span class="title-start">Panel OSK</span> bez
                <span>zgadywania.</span>
            </h2>
            <p class="story-description">
                Sprawdzaj jazdy, instruktorów, kursantów i płatności w jednym
                miejscu.
            </p>
        </div>
        <div class="route-scene" aria-hidden="true">
            <div class="product-board">
                <div class="board-header">
                    <span><Building2 :size="14" /> OSK Centrum</span>
                    <strong>Dzisiaj</strong>
                </div>
                <div class="board-grid">
                    <div class="schedule-panel">
                        <div class="panel-line">
                            <span
                                ><CalendarClock :size="14" /> Harmonogram</span
                            >
                            <strong>6 jazd</strong>
                        </div>
                        <div class="schedule-row">
                            <span class="time">09:00</span>
                            <span class="event-accent" />
                            <span
                                >Jazda praktyczna<strong
                                    >Kursant: Jan Nowak</strong
                                ></span
                            >
                            <CarFront :size="17" />
                        </div>
                        <div class="schedule-row muted">
                            <span class="time">11:30</span>
                            <span class="event-accent theory" />
                            <span
                                >Zajęcia teorii<strong
                                    >Kurs B, sala 2</strong
                                ></span
                            >
                            <BookOpen :size="17" />
                        </div>
                    </div>
                    <div class="side-stack">
                        <div class="mini-card attention">
                            <span>Do obsługi</span>
                            <strong>3 sprawy</strong>
                            <small>braki w kursach i grafikach</small>
                        </div>
                        <div class="mini-card">
                            <span>Płatności</span>
                            <strong>2 zaległe</strong>
                            <small>kursanci do kontaktu</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="story-footer">
            <p class="footer-description">
                Najważniejsze moduły po zalogowaniu
            </p>
            <ul class="story-features">
                <li>
                    <CalendarDays :size="16" aria-hidden="true" /> Harmonogram
                </li>
                <li><Users :size="16" aria-hidden="true" /> Kursanci</li>
                <li><CreditCard :size="16" aria-hidden="true" /> Płatności</li>
                <li>
                    <MessageSquareText :size="16" aria-hidden="true" /> Opinie
                </li>
            </ul>
        </div>
    </aside>
</template>

<style scoped>
.login-story {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 42px 48px 32px;
    background:
        radial-gradient(ellipse at 95% 80%, #17405a 0, transparent 58%), #102a3c;
    color: #f4f8fb;
}
.story-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}
.brand-mark {
    display: grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border: 1px solid #ffffff24;
    border-radius: 13px;
    background: #ffffff08;
    color: #7dd3fc;
}
.brand-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0;
}
.brand-name > span {
    margin-left: 5px;
    font-weight: 400;
}
.story-intro {
    margin-top: clamp(40px, 6vh, 72px);
}
.story-eyebrow {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #a4c3d6;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0;
}
.story-eyebrow > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #7dd3fc;
}
.story-title {
    margin-top: 21px;
    font-size: clamp(40px, 4.2vw, 62px);
    font-weight: 700;
    line-height: 1.13;
    letter-spacing: 0;
}
.story-title > span {
    color: #7dd3fc;
}
.story-title > .title-start {
    display: block;
    color: inherit;
}
.story-description {
    margin-top: 21px;
    color: #b3c7d4;
    font-size: 15px;
    line-height: 1.8;
}
.route-scene {
    position: relative;
    height: 280px;
    min-height: 280px;
    margin: 26px -18px 22px;
}
.product-board {
    position: absolute;
    inset: 6px 16px 0;
    padding: 18px;
    border: 1px solid #ffffff1f;
    border-radius: 14px;
    background: #0d2333;
    box-shadow: 0 18px 45px #05121d45;
}
.product-board::before {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: linear-gradient(#ffffff0a 1px, transparent 1px);
    background-size: 100% 46px;
    content: '';
    pointer-events: none;
}
.board-header,
.panel-line,
.schedule-row,
.mini-card {
    position: relative;
    z-index: 1;
}
.board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #a9c3d2;
    font-size: 10px;
}
.board-header span,
.panel-line span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
}
.board-header strong {
    color: #edf7fc;
    font-size: 11px;
}
.board-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 168px;
    gap: 12px;
    margin-top: 18px;
}
.schedule-panel,
.mini-card {
    border: 1px solid #ffffff1f;
    background: #f8fbfd;
    color: #203b4b;
}
.schedule-panel {
    padding: 16px;
    border-radius: 12px;
}
.panel-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e9ed;
    font-size: 11px;
    font-weight: 800;
}
.panel-line span {
    color: #19364a;
}
.panel-line strong {
    color: #087caf;
    font-size: 10px;
}
.schedule-row {
    display: grid;
    grid-template-columns: 43px 3px minmax(0, 1fr) 18px;
    gap: 10px;
    align-items: center;
    padding: 14px 0;
    color: #173044;
    font-size: 11px;
    font-weight: 800;
}
.schedule-row + .schedule-row {
    border-top: 1px solid #e8eef2;
}
.schedule-row > svg {
    color: #6a7f8d;
}
.schedule-row strong {
    display: block;
    margin-top: 4px;
    color: #6c7e8a;
    font-size: 9px;
    font-weight: 600;
}
.schedule-row.muted {
    color: #405a6a;
}
.time {
    font-variant-numeric: tabular-nums;
}
.event-accent {
    width: 3px;
    height: 38px;
    border-radius: 999px;
    background: #087caf;
}
.event-accent.theory {
    background: #f59e0b;
}
.side-stack {
    display: grid;
    gap: 12px;
}
.mini-card {
    display: flex;
    min-height: 86px;
    flex-direction: column;
    justify-content: center;
    padding: 14px;
    border-radius: 12px;
}
.mini-card span {
    color: #6c7e8a;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
}
.mini-card strong {
    margin-top: 6px;
    color: #173044;
    font-size: 18px;
    font-weight: 800;
}
.mini-card small {
    margin-top: 5px;
    color: #6c7e8a;
    font-size: 9px;
    line-height: 1.45;
}
.mini-card.attention {
    border-color: #bae6fd;
    background: #eef8fc;
}
.story-footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid #ffffff1c;
}
.footer-description {
    color: #e0ebf2;
    font-size: 12px;
    font-weight: 600;
}
.story-features {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 22px;
    margin-top: 14px;
    list-style: none;
    color: #a6bfce;
    font-size: 10px;
}
.story-features li {
    display: flex;
    align-items: center;
    gap: 7px;
}
@media (min-width: 960px) and (max-width: 1199px) {
    .login-story {
        padding-inline: 32px;
    }
    .story-title {
        font-size: 46px;
    }
    .story-features {
        column-gap: 12px;
    }
}
@media (max-width: 959px) {
    .login-story {
        padding: 24px 32px;
    }
    .story-intro {
        margin-top: 22px;
    }
    .story-title {
        margin-top: 0;
        font-size: 28px;
        letter-spacing: -1px;
    }
    .story-title > .title-start {
        display: inline;
    }
    .story-eyebrow,
    .story-description,
    .route-scene,
    .story-footer {
        display: none;
    }
    .brand-mark {
        width: 36px;
        height: 36px;
        border-radius: 10px;
    }
    .brand-name {
        font-size: 20px;
    }
}
@media (max-width: 479px) {
    .login-story {
        padding: 23px 24px;
    }
    .story-title {
        font-size: 23px;
    }
}
</style>
