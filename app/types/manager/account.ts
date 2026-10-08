export interface ManagerAccount {
    id: string;
    role: 'STUDENT' | 'INSTRUCTOR';
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    deletedAt: string | null;
    studentProfile?: { id: string } | null;
    instructorProfile?: { id: string } | null;
    accountActionsFor?: Array<{ status: string }>;
}
