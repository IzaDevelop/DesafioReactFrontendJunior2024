import { ReactElement } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
    children: ReactElement;
}

export function Layout(props: LayoutProps) {
    return (
        <div className="flex flex-col h-screen p-5 bg-gray">
            <Header/>
            <main className="h-auto w-full flex flex-col pb-5 items-center mx-auto sm:max-w-xl">
                {props.children}
            </main>
            <Footer />
        </div>
    )
}