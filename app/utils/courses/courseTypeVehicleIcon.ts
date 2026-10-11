import type { Component } from 'vue';
import {
    BusFront,
    CarFront,
    CircleHelp,
    Motorbike,
    Tractor,
    Truck,
} from 'lucide-vue-next';

const iconsByCategory: Record<string, Component> = {
    AM: Motorbike,
    A: Motorbike,
    A1: Motorbike,
    A2: Motorbike,
    B: CarFront,
    B1: CarFront,
    BE: CarFront,
    C: Truck,
    C1: Truck,
    CE: Truck,
    C1E: Truck,
    D: BusFront,
    D1: BusFront,
    DE: BusFront,
    D1E: BusFront,
    T: Tractor,
};

export function courseTypeVehicleIcon(code: string): Component {
    return iconsByCategory[code.trim().toUpperCase()] ?? CircleHelp;
}
