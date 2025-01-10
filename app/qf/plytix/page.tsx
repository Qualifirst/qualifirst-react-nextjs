"use client";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import * as _ from "lodash";

type FormState = {
    id?: number,
    label?: string,
    amazonComment?: string,
};
const FormStateDefaults = {
    label: '',
    amazonComment: '',
};

const FormToPlytix = {
    id: "_id",
    label: "label",
    amazonComment: "attributes.amazon_comment",
};

const Page = () => {
    const [formMessage, setFormMessage] = useState<string>("");
    const [form, setForm] = useState<FormState>(FormStateDefaults);

    const updateForm = useCallback((formValues: object) => {
        setForm(Object.assign({}, form, formValues));
    }, [form]);

    const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateForm({[event.target.name]: event.target.value});
    };

    const searchParams = useMemo(() => {
        return new URLSearchParams(typeof window !== "undefined" ? window?.location?.search : "");
    }, []);
    const sku = searchParams.get("sku");

    const [loading, setLoading] = useState<boolean>(true);
    const [loadingError, setLoadingError] = useState<string>("");

    const error = useMemo(() => {
        if (!sku) return "SKU missing from request.";
        else if (loadingError) return loadingError;
        return null;
    }, [sku, loadingError]);

    const [plytixAccessToken, setPlytixAccessToken] = useState<string>("");

    // Initialize data
    useEffect(() => {
        if (!sku) {
            setLoading(false);
            return;
        };

        fetch(
            "https://auth.plytix.com/auth/api/get-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    api_key: "7WLG14B0SLQ4B1TROO02",
                    api_password: "1jk5TGKRiWM=F/QvPQ0.Y3cUC;Vhw2avwGT9k%9D",
                }),
            },

        )
        .then((response) => {
            response.json().then((data) => {
                const accessToken = (data?.data || [])[0]?.access_token;
                if (accessToken) {
                    setPlytixAccessToken(accessToken);
                    fetch(
                        "https://pim.plytix.com/api/v2/products/search",
                        {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                "filters": [
                                    [
                                        {
                                            "field": "sku",
                                            "operator": "eq",
                                            "value": sku,
                                        },
                                    ],
                                ],
                            }),
                        },
                    )
                    .then((response) => {
                        response.json().then((data) => {
                            const productId = (data?.data || [])[0]?._id;
                            if (productId) {
                                fetch(
                                    `https://pim.plytix.com/api/v2/products/${productId}`,
                                    {
                                        method: "GET",
                                        headers: {
                                            "Authorization": `Bearer ${accessToken}`,
                                            "Content-Type": "application/json",
                                        },
                                    },
                                )
                                .then((response) => {
                                    response.json().then((data) => {
                                        const product = (data?.data || [])[0];
                                        if (product) {
                                            const formValues = {};
                                            for (const field in FormToPlytix) {
                                                const plytixField = FormToPlytix[field];
                                                formValues[field] = _.get(product, plytixField, FormStateDefaults[field]);
                                            }
                                            updateForm(formValues);
                                        } else {
                                            setLoadingError(`Plytix Product Not Found: ${sku}`);
                                        }
                                        setLoading(false);
                                    });
                                });
                            } else {
                                setLoadingError(`Plytix Product ID Not Found for: ${sku}`);
                                setLoading(false);
                            }
                        });
                    })
                } else {
                    setLoadingError("Plytix Authorization Error");
                    setLoading(false);
                }
            });
        });
    }, []);

    const handleFormSubmit = useCallback((event: FormEvent) => {
        event.preventDefault();
        setFormMessage("");
        if (form.id && form.label) {
            const formValues = {};
            for (const field in FormToPlytix) {
                if (field === "id") continue;
                const plytixField = FormToPlytix[field];
                _.set(formValues, plytixField, form[field]);
            }
            fetch(
                `https://pim.plytix.com/api/v2/products/${form.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${plytixAccessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formValues),
                },
            )
            .then((response) => {
                if (response.ok) {
                    setFormMessage("Update OK");
                } else {
                    setFormMessage("Update Error!");
                }
            });
        }
    }, [plytixAccessToken, form, setFormMessage]);

    return <>
        <div>
            { loading ? (
                <p className="py-8">Loading...</p>
            ) : (
                !error ? (
                    <>
                    <form className="max-w-sm py-8" onSubmit={handleFormSubmit}>
                        <div className="mb-5">
                            <label htmlFor="label" className="block mb-2 text-sm font-medium text-gray-900">Product name</label>
                            <input
                                type="label" id="label" name="label" placeholder="Enter name"
                                value={form.label} onChange={handleFormChange} required
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="mb-5">
                            <label htmlFor="amazonComment" className="block mb-2 text-sm font-medium text-gray-900">Amazon comment</label>
                            <input
                                type="amazonComment" id="amazonComment" name="amazonComment" placeholder="Enter amazon comment"
                                value={form.amazonComment} onChange={handleFormChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            />
                        </div>
                        <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                        >
                            Submit
                        </button>
                        { formMessage ? <p>{formMessage}</p> : null }
                    </form>
                    </>
                ) : (
                    <p className="py-8">Error: <span>{error}</span></p>
                )
            )}
        </div>
    </>;
};

export default Page;
