const checkKey = async (request, context) => {
    let params = new URLSearchParams(context.url.search);
    let key = params.get("key");
    //let expectedKey = process.env.AUTH_KEY;
    if (key !== "123") {
        const path = "/error/unauthorized";
        return new URL(path, request.url);
    }
};

export const config = {
    path: ["/qf/*"],
};

export default checkKey;
