export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    const body = await readBody(event);

    const nameRaw = body?.name;
    const name =
        typeof nameRaw === 'string' ? nameRaw.trim() : String(nameRaw ?? '');

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Pole name jest wymagane',
        });
    }

    const cityRaw = body?.city;
    const addressRaw = body?.address;

    const city =
        typeof cityRaw === 'string'
            ? cityRaw.trim() || undefined
            : cityRaw == null
              ? undefined
              : String(cityRaw).trim() || undefined;

    const address =
        typeof addressRaw === 'string'
            ? addressRaw.trim() || undefined
            : addressRaw == null
              ? undefined
              : String(addressRaw).trim() || undefined;

    if (upstream) {
        /*
         * Tryb upstream (NUXT_API_UPSTREAM): żądanie jest proxowane do zewnętrznego
         * backendu z access_token w nagłówku Authorization. Weryfikacja roli MANAGER
         * odbywa się po stronie backendu — BFF jej tu nie powtarza.
         */
        return bffUpstreamDrivingSchoolsCreate(event, upstream, {
            name,
            ...(city !== undefined ? { city } : {}),
            ...(address !== undefined ? { address } : {}),
        });
    }

    // Tryb lokalny (bez NUXT_API_UPSTREAM): weryfikujemy rolę samodzielnie z ciasteczka JWT.
    await requireManagerFromCookie(event);

    const created = mockDrivingSchoolsPush({
        name,
        city: city ?? null,
        address: address ?? null,
    });

    return {
        success: true,
        data: created,
    };
});
