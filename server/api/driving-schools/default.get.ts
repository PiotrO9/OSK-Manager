export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsDefault(event, upstream);
    }

    await requireManagerFromCookie(event);

    const school = mockDrivingSchoolsGetDefault();

    return {
        success: true,
        data: school,
    };
});
