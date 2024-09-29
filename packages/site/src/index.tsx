import React from "react";
import ReactDOM from "react-dom/client";
import { Main } from "./Main";

// Render app
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<React.StrictMode><Main/></React.StrictMode>);

// Remove trailing slash
window.onload = () => {
	if (window.location.pathname.endsWith("/"))
		window.history.pushState({}, "", window.location.pathname.replace(/\/+$/, ""));
};
