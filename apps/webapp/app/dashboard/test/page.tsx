
"use client";

import { useState, useEffect } from "react";
import { getClasses } from "@/lib/classes";

export default function TestPage() {
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        getClasses().then((res) => {
            setResult(res);
        }).catch((err) => {
            setError(err.message);
        });
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (!result) return <div>Loading...</div>;

    return (
        <pre>{JSON.stringify(result, null, 2)}</pre>
    );
}
