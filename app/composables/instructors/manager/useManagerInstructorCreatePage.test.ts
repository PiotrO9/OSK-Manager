import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref, type EffectScope } from 'vue';
import { useManagerInstructorCreatePage } from './useManagerInstructorCreatePage';

const { requestBffSuccess, registerGuard } = vi.hoisted(() => ({
    requestBffSuccess: vi.fn(),
    registerGuard: vi.fn(),
}));

vi.mock('../../core/useApi', () => ({ requestBffSuccess }));
vi.mock('vue-router', async (importOriginal) => ({
    ...(await importOriginal<typeof import('vue-router')>()),
    onBeforeRouteLeave: registerGuard,
}));
const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';
const fetchList = vi.fn();
const addToast = vi.fn();
const navigateTo = vi.fn();
let scope: EffectScope;
let mount: () => void;
let unmount: () => void;
const addEventListener = vi.fn();
const removeEventListener = vi.fn();

async function createPage() {
    const page = scope.run(() => useManagerInstructorCreatePage())!;

    await page.loadSchools();
    await nextTick();

    return page;
}

function fillForm(page: ReturnType<typeof useManagerInstructorCreatePage>) {
    page.emailModel.value = 'jan@example.com';
    page.passwordModel.value = 'secret123';
    page.firstNameModel.value = 'Jan';
    page.lastNameModel.value = 'Nowak';
    page.licenseNumberModel.value = 'LIC-1';
    page.birthDateModel.value = '2000-02-29';
}

describe('instructor create page', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        scope = effectScope();
        fetchList.mockResolvedValue([{ id: SCHOOL_ID, name: 'OSK Test' }]);
        requestBffSuccess.mockResolvedValue(undefined);
        navigateTo.mockResolvedValue(undefined);
        vi.stubGlobal('useState', (_key: string, init: () => string) =>
            ref(init()),
        );
        vi.stubGlobal('useDrivingSchoolsApi', () => ({ fetchList }));
        vi.stubGlobal('useAppToast', () => ({ addToast }));
        vi.stubGlobal('navigateTo', navigateTo);
        vi.stubGlobal('onMounted', (callback: () => void) => {
            mount = callback;
        });
        vi.stubGlobal('onBeforeUnmount', (callback: () => void) => {
            unmount = callback;
        });
        vi.stubGlobal('window', { addEventListener, removeEventListener });
    });
    afterEach(() => {
        unmount?.();
        scope.stop();
        vi.unstubAllGlobals();
    });

    it('returns the first invalid field without issuing a request', async () => {
        const page = await createPage();

        expect(await page.handleSubmit()).toEqual({
            status: 'field-error',
            field: 'email',
        });
        expect(requestBffSuccess).not.toHaveBeenCalled();
    });

    it.each(['Email already exists', 'Email already registered'])(
        'maps %s to email and clears it only after editing',
        async (message) => {
            const page = await createPage();

            fillForm(page);
            requestBffSuccess.mockRejectedValue(
                Object.assign(
                    new Error('[POST] /api/auth/register: 409 Conflict'),
                    {
                        statusCode: 409,
                        data: { success: false, error: message },
                    },
                ),
            );
            expect(await page.handleSubmit()).toEqual({
                status: 'field-error',
                field: 'email',
            });
            expect(page.fieldErrors.value.email).toBe(
                'Ten adres e-mail jest już zajęty.',
            );
            expect(page.apiError.value).toBeNull();
            expect(addToast).not.toHaveBeenCalled();
            expect(page.firstNameModel.value).toBe('Jan');
            expect(page.isDirty.value).toBe(true);
            page.firstNameModel.value = 'Janusz';
            expect(page.fieldErrors.value.email).toBeTruthy();
            page.emailModel.value = 'other@example.com';
            expect(page.fieldErrors.value.email).toBeUndefined();
        },
    );

    it('does not treat unrelated conflicts as email errors', async () => {
        const page = await createPage();

        fillForm(page);
        requestBffSuccess.mockRejectedValue(
            Object.assign(
                new Error('Instructor is already assigned to a driving school'),
                { statusCode: 409 },
            ),
        );
        expect(await page.handleSubmit()).toEqual({ status: 'error' });
        expect(page.fieldErrors.value.email).toBeUndefined();
        expect(page.apiError.value).toBeTruthy();
        expect(page.isDirty.value).toBe(true);
    });

    it('shares one discard decision and preserves data after cancellation', async () => {
        const page = await createPage();
        const guard = registerGuard.mock.calls[0]![0] as () =>
            | boolean
            | Promise<boolean>;

        expect(guard()).toBe(true);
        fillForm(page);
        const first = guard();

        expect(guard()).toBe(first);
        expect(page.isLeaveDialogOpen.value).toBe(true);
        page.cancelLeave();
        expect(await first).toBe(false);
        expect(page.emailModel.value).toBe('jan@example.com');
        expect(page.isDirty.value).toBe(true);
        const second = guard();

        page.confirmDiscard();
        expect(await second).toBe(true);
    });

    it('blocks navigation and repeated submission while saving', async () => {
        const page = await createPage();

        fillForm(page);
        let finish!: () => void;

        requestBffSuccess.mockReturnValue(
            new Promise<void>((resolve) => {
                finish = resolve;
            }),
        );
        const submit = page.handleSubmit();
        const guard = registerGuard.mock.calls[0]![0] as () => boolean;

        expect(guard()).toBe(false);
        expect(await page.handleSubmit()).toEqual({ status: 'ignored' });
        finish();
        await submit;
        expect(requestBffSuccess).toHaveBeenCalledOnce();
        expect(guard()).toBe(true);
    });

    it('keeps confirmed creation after failed navigation and cannot submit again', async () => {
        const page = await createPage();

        fillForm(page);
        navigateTo.mockResolvedValue(false);
        expect(await page.handleSubmit()).toEqual({ status: 'created' });
        expect(page.isCreated.value).toBe(true);
        expect(page.isDirty.value).toBe(false);
        expect(page.navigationError.value).toContain('Konto zostało utworzone');
        expect(page.apiError.value).toBeNull();
        expect(await page.handleSubmit()).toEqual({ status: 'ignored' });
        navigateTo.mockResolvedValue(undefined);
        await page.returnToList();
        expect(page.navigationError.value).toBeNull();
        expect(requestBffSuccess).toHaveBeenCalledOnce();
        expect(requestBffSuccess.mock.calls[0]![2].body.birthDate).toBe(
            '2000-02-29',
        );
    });

    it('adds and removes beforeunload protection and disables it after creation', async () => {
        const page = await createPage();

        mount();
        await nextTick();
        const handler = addEventListener.mock.calls[0]![1] as (event: {
            preventDefault: () => void;
            returnValue: string;
        }) => void;
        const event = { preventDefault: vi.fn(), returnValue: '' };

        handler(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        fillForm(page);
        handler(event);
        expect(event.preventDefault).toHaveBeenCalledOnce();
        await page.handleSubmit();
        handler(event);
        expect(event.preventDefault).toHaveBeenCalledOnce();
        unmount();
        expect(removeEventListener).toHaveBeenCalledWith(
            'beforeunload',
            handler,
        );
    });
});
