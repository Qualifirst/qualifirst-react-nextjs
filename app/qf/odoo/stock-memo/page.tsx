"use server";
import "./style.css";
import {ReloadButton} from "../../../components/reload-button";

export default async function Page({searchParams}) {
    const odooAccessKey = process.env.ODOO_ACCESS_KEY;
    if (!odooAccessKey) {
        return <div>Error: No Odoo Access Key in env vars.</div>;
    }

    const odooApiUrl = process.env.ODOO_API_URL;
    if (!odooApiUrl) {
        return <div>Error: No Odoo API URL in env vars.</div>;
    }

    const params = await searchParams;
    const skus: string = params.skus;
    const skusList = (skus || '').split(",").map((sku) => sku.trim()).filter((sku) => sku);
    if (!skusList.length) {
        return <div>Error: No SKUS received.</div>;
    }

    const response = await fetch(
        `${odooApiUrl}?skus=${skus}`,
        {
            method: "GET",
            headers: {
                "Odoo-Access-Key": odooAccessKey,
            },
        },
    );
    let data = {};
    const responseBody = await response.text();
    try {
        data = JSON.parse(responseBody);
    } catch (err) {
        console.error(`Invalid response: ${responseBody}\nERROR: ${err}`);
        return <div>Error: Invalid response.</div>;
    }

    const count = Object.keys(data).length;

    const qtys = Object.entries(data).flatMap(([sku, qtysByCompany]) =>
        Object.entries(qtysByCompany).flatMap(([company, qtys]) => {
            return {
                id: `${sku}-${company}`,
                sku: sku,
                company: company,
                qtys: qtys,
            };
        })
    );

    return <>
        <div className="my-1">
            <table>
                <thead>
                    <tr>
                        {count !== 1 ? <th className="text-center">Product</th> : null}
                        <th className="text-center">Location</th>
                        <th className="text-right">On Hand</th>
                        <th className="text-right">Reserved</th>
                        <th className="text-right">Outgoing</th>
                        <th className="text-right">Incoming</th>
                        <th className="text-right">Manufacturable</th>
                        <th className="text-center">ETA</th>
                        <th className="min"><ReloadButton /></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        qtys.map((item) => (
                            <tr key={item.id} id={item.id}>
                                {count !== 1 ? <td className="text-center">{item.sku}</td> : null}
                                <td className="text-center">{item.company}</td>
                                <td className="text-right">{item.qtys['qty_available'].toFixed(2)}</td>
                                <td className="text-right">{item.qtys['reserved_qty'].toFixed(2)}</td>
                                <td className="text-right">{item.qtys['outgoing_qty'].toFixed(2)}</td>
                                <td className="text-right">{item.qtys['incoming_qty'].toFixed(2)}</td>
                                <td className="text-right">{item.qtys['manufacturable_qty'].toFixed(2)}</td>
                                <td className="text-center">{item.qtys['incoming_dates'].map(((inDate, idx) => (
                                    <div key={`${item.id}-${idx}`}>
                                        {inDate["date"]} / {inDate["qty"].toFixed(2)}
                                    </div>
                                )))}</td>
                                <td className="min"></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    </>;
};
