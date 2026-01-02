import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import '../css/common/Index.css'
import '../css/HomePage.css'
import HomeHero from "../components/common/HomeHero";

export default function Homepage() {
  return (
    <div>
      <Navbar />
        <main>
          <HomeHero />
        </main>
      <Footer />
    </div>
  );
}
