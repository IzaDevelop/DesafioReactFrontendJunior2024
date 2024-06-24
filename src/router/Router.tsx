import { Navigate, Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { Home } from "../pages/Home";
import { Test } from "../pages/test";

export function Router() {
    
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <Routes>
            <Route path="*" element={<Navigate replace to="/" />} />
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<Test />} />
        </Routes>
    )
}