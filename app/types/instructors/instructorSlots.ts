/**
 * Slot dostępności instruktora (odpowiedź GET …/availability/slots).
 */
export interface AvailabilitySlot {
    /** Dzień kalendarzowy YYYY-MM-DD */
    date: string;
    /** Początek slotu HH:mm */
    startTime: string;
    /** Koniec slotu HH:mm */
    endTime: string;
}
