"use client";
import { useCallback, useState } from "react";
import "./style.css";


export default function Page() {
    const [shopifyAccessToken, setShopifyAccessToken] = useState('');
    const [shopifyDomain, setShopifyDomain] = useState('');
    const [newWebhookTopic, setNewWebhookTopic] = useState('');
    const [newWebhookURL, setNewWebhookURL] = useState('');

    const changeShopifyAccessToken = useCallback((e) => {
        setShopifyAccessToken(e.target.value);
    }, [setShopifyAccessToken]);
    const changeShopifyDomain = useCallback((e) => {
        setShopifyDomain(e.target.value);
    }, [setShopifyDomain]);
    const changeNewWebhookTopic = useCallback((e) => {
        setNewWebhookTopic(e.target.value);
    }, [setNewWebhookTopic]);
    const changeNewWebhookURL = useCallback((e) => {
        setNewWebhookURL(e.target.value);
    }, [setNewWebhookURL]);

    const [webhooks, setWebhooks] = useState([]);
    const [searched, setSearched] = useState(false);

    const loadWebhooks = useCallback(async () => {
        if (shopifyAccessToken && shopifyDomain) {
            setSearched(true);
            const response = await fetch("/.netlify/functions/shopify-graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Domain": shopifyDomain,
                    "X-Shopify-Access-Token": shopifyAccessToken,
                },
                body: JSON.stringify({
                    query: `query getWebhooks {
                        webhookSubscriptions(first: 200) {
                            nodes {
                                id
                                topic
                                format
                                callbackUrl
                            }
                        }
                    }`,
                }),
            });
            const data = await response.json();
            setWebhooks(data?.data?.webhookSubscriptions?.nodes);
        }
    }, [shopifyAccessToken, shopifyDomain, setWebhooks, setSearched]);

    const searchWebhooks = useCallback(async (e) => {
        e.preventDefault();
        setWebhooks([]);
        loadWebhooks();
    }, [loadWebhooks]);

    const deleteWebhook = useCallback(async (webhookId) => {
        if (shopifyAccessToken && shopifyDomain && webhookId) {
            setWebhooks([]);
            const response = await fetch("/.netlify/functions/shopify-graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Domain": shopifyDomain,
                    "X-Shopify-Access-Token": shopifyAccessToken,
                },
                body: JSON.stringify({
                    query: `mutation deleteWebhook($id: ID!) {
                        webhookSubscriptionDelete(id: $id) {
                            deletedWebhookSubscriptionId
                            userErrors {
                                field
                                message
                            }
                        }
                    }`,
                    variables: {
                        id: webhookId,
                    },
                }),
            });
            console.log(await response.json());
            loadWebhooks();
        }
    }, [shopifyAccessToken, shopifyDomain, loadWebhooks]);

    const createNewWebhook = useCallback(async () => {
        if (shopifyDomain && shopifyAccessToken && newWebhookTopic && newWebhookURL) {
            setWebhooks([]);
            setNewWebhookTopic('');
            setNewWebhookURL('');
            const response = await fetch("/.netlify/functions/shopify-graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Domain": shopifyDomain,
                    "X-Shopify-Access-Token": shopifyAccessToken,
                },
                body: JSON.stringify({
                    query: `mutation createWebhook($topic: WebhookSubscriptionTopic!, $callbackURL: URL!) {
                        webhookSubscriptionCreate(topic: $topic, webhookSubscription: {
                            callbackUrl: $callbackURL,
                            format: JSON,
                        }) {
                            webhookSubscription {
                                id
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }`,
                    variables: {
                        topic: newWebhookTopic,
                        callbackURL: newWebhookURL,
                    },
                }),
            });
            console.log(await response.json());
            loadWebhooks();
        }
    }, [shopifyDomain, shopifyAccessToken, newWebhookTopic, newWebhookURL, setNewWebhookTopic, setNewWebhookURL]);

    return <>
        <div className="mt-3 px-5">
            <h1 className="text-xl">Shopify Webhook Manager</h1>
        </div>
        <div className="mt-3">
            <form method="post" onSubmit={searchWebhooks} className="px-5">
                <div className="block flex items-center py-2">
                    <label htmlFor="shopify_domain" className="shrink">Shopify Domain</label>
                    <input name="shopify_domain" type="text" placeholder="Shopify Domain" onChange={changeShopifyDomain} value={shopifyDomain}
                        className="block grow mx-10 p-1 outline-2 outline-gray-300 -outline-offset-1 outline rounded"/>
                </div>
                <div className="block flex items-center py-2">
                    <label htmlFor="shopify_access_token" className="shrink">Shopify Access Token</label>
                    <input name="shopify_access_token" type="text" placeholder="Shopify Access Token" onChange={changeShopifyAccessToken} value={shopifyAccessToken}
                        className="block grow mx-10 p-1 outline-2 outline-gray-300 -outline-offset-1 outline rounded"/>
                </div>
                <div className="block flex items-center py-2">
                    <button type="submit" className="shrink block p-1 outline-1 outline-gray-500 bg-gray-300 rounded hover:bg-gray-500 hover:text-white">Submit</button>
                </div>
            </form>
        </div>
        <div className="mt-3 px-5 table">
            <div className="outline outline-1 outline-gray-200 table-row hover:bg-gray-100 font-bold">
                <div className="table-cell p-1.5">ID</div>
                <div className="table-cell p-1.5">Topic <a href="https://shopify.dev/docs/api/admin-graphql/unstable/enums/WebhookSubscriptionTopic" target="_blank">[-&gt;]</a></div>
                <div className="table-cell p-1.5">Callback URL</div>
                <div className="table-cell p-1.5"></div>
            </div>
            <div className="outline outline-1 outline-gray-200 table-row hover:bg-gray-100">
                <div className="table-cell p-1.5">-</div>
                <div className="table-cell p-1.5">
                    <div className="flex">
                        <input type="text" placeholder="Topic" onChange={changeNewWebhookTopic} value={newWebhookTopic}
                            className="outline outline-2 outline-gray-300 w-100 rounded block grow" />
                    </div>
                </div>
                <div className="table-cell p-1.5">
                    <div className="flex">
                        <input type="text" placeholder="Callback URL" onChange={changeNewWebhookURL} value={newWebhookURL}
                            className="outline outline-2 outline-gray-300 w-100 rounded block grow" />
                    </div></div>
                <div className="table-cell p-1.5">
                    <button type="button" className="px-1 py-0.5 rounded bg-green-500 text-white" title="Delete Webhook" onClick={createNewWebhook}>+</button>
                </div>
            </div>
            {(webhooks || []).sort((a, b) => {
                const callbackUrlCompare = a.callbackUrl.localeCompare(b.callbackUrl);
                if (callbackUrlCompare !== 0) return callbackUrlCompare;
                const topicCompare = a.topic.localeCompare(b.topic);
                if (topicCompare !== 0) return topicCompare;
                const idCompare = a.id.localeCompare(b.id);
                if (idCompare !== 0) return idCompare;
                return 0;
            }).map((webhook) => {
                return <div key={webhook.id} className="outline outline-1 outline-gray-200 table-row hover:bg-gray-100">
                    <div className="table-cell p-1.5">{webhook.id.split("/").at(-1)}</div>
                    <div className="table-cell p-1.5">{webhook.topic}</div>
                    <div className="table-cell p-1.5">{webhook.callbackUrl}</div>
                    <div className="table-cell p-1.5">
                        <button type="button" className="px-1 py-0.5 rounded bg-red-500 text-white" title="Delete Webhook" onClick={() => deleteWebhook(webhook.id)}>&times;</button>
                    </div>
                </div>;
            })}
            {(webhooks === undefined || webhooks.length === 0) && searched && (
                <div className="outline outline-1 outline-gray-200 table-row hover:bg-gray-100 text-gray-400">
                    <div></div>
                    <div className="table-cell p-1.5">
                        No webhooks found...
                    </div>
                    <div></div>
                </div>
            )}
        </div>
    </>;
};
