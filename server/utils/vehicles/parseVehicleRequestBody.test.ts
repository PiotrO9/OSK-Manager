import { describe, expect, it } from 'vitest';
import { parseVehicleWriteFields } from './parseVehicleRequestBody';
const id = '11111111-1111-4111-8111-111111111111';
const fields = { name: 'Car', registrationNumber: 'WA1234' };

describe('vehicle category BFF payload', () => {
    it('preserves omission for PATCH', () =>
        expect(parseVehicleWriteFields(fields)).not.toHaveProperty(
            'supportedCourseTypeIds',
        ));
    it.each([[], null, ['bad'], 42].map((value) => ({ value })))(
        'rejects $value',
        ({ value }) =>
            expect(
                parseVehicleWriteFields({
                    ...fields,
                    supportedCourseTypeIds: value,
                }),
            ).toBeNull(),
    );
    it('deduplicates category IDs', () =>
        expect(
            parseVehicleWriteFields({
                ...fields,
                supportedCourseTypeIds: [id, id],
            }),
        ).toMatchObject({ supportedCourseTypeIds: [id] }));
});
