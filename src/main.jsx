import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App.jsx";
import "./index.css";
import creditos from './components/Creditos.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* El Router envuelve absolutamente todo */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
