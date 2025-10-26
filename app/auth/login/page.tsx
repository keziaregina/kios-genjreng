import Greetings from "./components/Greetings";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {

    return (
        <div className="min-h-screen bg-primary flex flex-col py-20 gap-[54px]">
            <Greetings/>
            <LoginForm/>
        </div>
    )
}

export default LoginPage;