import { Suspense } from "react";

import Greetings from "./components/Greetings";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {
  return (
    <div className="bg-primary flex min-h-screen flex-col gap-[54px] py-20">
      <Greetings />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
