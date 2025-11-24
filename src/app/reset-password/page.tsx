import { Suspense } from "react";
import ResetPasswordPage from "./ResetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
