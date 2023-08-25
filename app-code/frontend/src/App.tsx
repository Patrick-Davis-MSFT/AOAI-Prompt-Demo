import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

import "./App.css";

import Layout from "./pages/layout/Layout";
import Summary from "./pages/summary/summary";

initializeIcons();

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Summary />
            },
            {
                path: "*",
                lazy: () => import("./pages/NoPage")
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <FluentProvider theme={webLightTheme}>
            <RouterProvider router={router} />
        </FluentProvider>
    </React.StrictMode>
);
