'use client';

import { useCallback } from "react";


export function ReloadButton() {
    const reload = useCallback(() => {
        window.location.reload();
    });

    return (
        <button type="button" onClick={reload} className="reload-button" title="Reload">
            <span>⟳</span>
        </button>
    );
}
