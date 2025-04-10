const checkKey = async (request, context) => {
    let params = new URLSearchParams(context.url.search);
    let key = params.get("key");
    let expectedKey = Deno.env.get("AUTH_KEY");
    if (key !== expectedKey) {
        const path = "/error/unauthorized";
        return new URL(path, request.url);
    }
};

export const config = {
    path: ["/qf/*"],
};

export default checkKey;
