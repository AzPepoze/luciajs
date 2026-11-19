import { attach } from "lucia";
import Counter from "./components/Counter.lucia";
import Features from "./components/Features.lucia";
import Footer from "./components/Footer.lucia";
import Header from "./components/Header.lucia";
import Hero from "./components/Hero.lucia";
import Signup from "./components/Signup.lucia";

const slot = (name: string) => document.getElementById(`slot-${name}`)!;

attach(Header, slot("header"));
attach(Hero, slot("hero"));
attach(Features, slot("features"));
attach(Counter, slot("counter"));
attach(Signup, slot("signup"));
attach(Footer, slot("footer"));
