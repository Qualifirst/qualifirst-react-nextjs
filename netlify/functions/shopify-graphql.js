exports.handler = async function({headers, body}) {
    const response = await fetch(
        `https://${headers["x-shopify-domain"]}/admin/api/2025-04/graphql.json`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": headers["x-shopify-access-token"],
            },
            body: body,
        },
    );
    return {
        statusCode: 200,
        body: JSON.stringify(await response.json()),
    }
}
