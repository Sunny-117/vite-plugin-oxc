import React, { useState } from "react";
import UseMemoDemo from "./useMapDemo";
import UseCancelableDemo from "./UseCancelableDemo";
export default function App() {
  return (
    <div>
      App
      <UseMemoDemo />
      <hr />
      <UseCancelableDemo />
    </div>
  );
}
