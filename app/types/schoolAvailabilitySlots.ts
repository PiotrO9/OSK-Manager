/**
 * Slot agregowany OSK (odpowiedź GET …/driving-schools/:id/availability/slots).
 */
export interface SchoolAvailabilitySlot {
    instructorId: string;
    instructorFirstName: string;
    instructorLastName: string;
    /** Dzień kalendarzowy YYYY-MM-DD */
    date: string;
    /** Początek slotu HH:mm */
    startTime: string;
    /** Koniec slotu HH:mm */
    endTime: string;
}
