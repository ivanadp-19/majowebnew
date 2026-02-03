"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const { projectId, dataset } = client.config();
const urlFor = (source: any) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Datos de servicios de nutrición
const servicios = [
  {
    id: 1,
    category: "PLAN PERSONALIZADO",
    title: "Nutrición Integral",
    description: "Un plan diseñado exclusivamente para ti. Analizamos tu estilo de vida, objetivos y preferencias para crear una alimentación que se adapte a tu día a día.",
    bgColor: "bg-[#5a8a6a]",
    textColor: "text-white",
    accentColor: "#a8e4c0",
  },
  {
    id: 2,
    category: "PÉRDIDA DE PESO",
    title: "Transforma Tu Cuerpo",
    description: "Logra tu peso ideal de forma saludable y sostenible. Sin dietas restrictivas, solo cambios reales que puedes mantener para siempre.",
    bgColor: "bg-[#e8a855]",
    textColor: "text-dark",
    accentColor: "#fff5e0",
  },
  {
    id: 3,
    category: "NUTRICIÓN DEPORTIVA",
    title: "Rendimiento Óptimo",
    description: "Maximiza tu rendimiento deportivo con una alimentación estratégica. Ideal para atletas y personas activas que buscan resultados.",
    bgColor: "bg-[#7a5a8a]",
    textColor: "text-white",
    accentColor: "#e0c8f0",
  },
  {
    id: 4,
    category: "BIENESTAR DIGESTIVO",
    title: "Salud Intestinal",
    description: "Mejora tu digestión y bienestar general. Tratamos intolerancias, hinchazón y problemas digestivos con un enfoque natural y efectivo.",
    bgColor: "bg-[#8a6a5a]",
    textColor: "text-white",
    accentColor: "#f0d8c8",
  },
];

const testimonios = [
  {
    quote: "Majo *cambió mi relación* con la comida. Ya no veo la alimentación como una restricción, sino como un regalo.",
    subtext: "Perdí 15 kilos en 6 meses sin pasar hambre. Su enfoque es completamente diferente a todo lo que había probado antes.",
    author: "Carolina",
    company: "Ejecutiva de Marketing",
  },
  {
    quote: "Mi rendimiento en el gimnasio *mejoró increíblemente*. Nunca me había sentido con tanta energía.",
    subtext: "Como atleta, necesitaba alguien que entendiera mis necesidades. Majo diseñó un plan perfecto para mis entrenamientos.",
    author: "Diego",
    company: "Triatleta Amateur",
  },
  {
    quote: "Por fin *encontré la solución* a mis problemas digestivos. Llevaba años buscando respuestas.",
    subtext: "Después de solo 2 meses, mi hinchazón desapareció. Majo identificó exactamente qué alimentos me afectaban.",
    author: "Valentina",
    company: "Diseñadora Gráfica",
  },
];

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  image?: any;
  categories?: Array<{ title: string; slug: { current: string } }>;
}

export default function NutricionPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Optimized query: only fetch published posts with slugs, limit to 3
        const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...3] {
          _id,
          title,
          slug,
          image,
          "categories": categories[]-> {
            title,
            slug
          }
        }`;
        const data = await client.fetch<Post[]>(query);
        setPosts(data || []);
      } catch (error: any) {
        console.error("Error fetching posts:", error);
        console.error("Error details:", {
          message: error?.message,
          statusCode: error?.statusCode,
          response: error?.response,
        });
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`,
            backgroundColor: '#7a9a8a',
          }}
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* Navigation */}
        <nav className="relative z-50 flex items-center justify-between px-6 py-4 lg:px-12">
          <Link href="/" className="flex items-center">
            <div className="bg-cream rounded-full px-6 py-3 border-2 border-dark shadow-lg">
              <span className="display-text text-lg lg:text-xl tracking-wider text-dark">
                Majo<span className="font-normal italic mx-1 text-base">Alonzo</span>
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: "INICIO", href: "/" },
              { label: "SOBRE MÍ", href: "/sobre-mi" },
              { label: "SERVICIOS", href: "/servicios" },
              { label: "PRODUCTOS", href: "/productos-recomendados" },
              { label: "CONTACTO", href: "/contacto" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="nav-link text-dark hover:text-lime transition-colors text-sm">
                {item.label}
              </Link>
            ))}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-cream rounded-full p-3 border-2 border-dark shadow-lg hover:bg-lavender transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden bg-cream rounded-full p-3 border-2 border-dark shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Decorative Leaf */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-24 z-40">
          <svg className="w-8 h-8 lg:w-10 lg:h-10 text-lavender" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 2C20 2 35 10 35 25C35 35 25 38 20 38C15 38 5 35 5 25C5 10 20 2 20 2Z" />
            <path d="M20 38V15" stroke="#c4e34d" strokeWidth="2" fill="none" />
            <path d="M20 20L12 15" stroke="#c4e34d" strokeWidth="1.5" fill="none" />
            <path d="M20 25L28 20" stroke="#c4e34d" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
          <h2 className="script-text text-3xl lg:text-5xl text-cream mb-2 lg:mb-4">
            transforma tu vida con
          </h2>
          <h1 
            className="display-text text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] xl:text-[10rem] leading-none tracking-wider"
            style={{ color: '#E891B1' }}
          >
            NUTRICIÓN
          </h1>
          <p className="text-cream/90 text-lg lg:text-xl mt-4 max-w-2xl">
            Planes personalizados que se adaptan a tu estilo de vida
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 lg:mt-12">
            <Link 
              href="/agendar"
              className="bg-cream/90 backdrop-blur-sm text-dark px-8 py-4 rounded-full border-2 border-cream hover:bg-cream transition-all nav-link text-sm shadow-lg"
            >
              AGENDA TU CONSULTA
            </Link>
            <Link 
              href="/servicios"
              className="bg-cream/90 backdrop-blur-sm text-dark px-8 py-4 rounded-full border-2 border-cream hover:bg-cream transition-all nav-link text-sm shadow-lg"
            >
              VER SERVICIOS
            </Link>
          </div>
        </div>

       
        {/* Wave Divider */}
        <div className="wave-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" className="shape-fill" />
          </svg>
        </div>
      </section>

      {/* Intro Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-5xl font-serif leading-relaxed text-dark">
              Por fin, una <span className="script-text text-4xl lg:text-6xl">alimentación</span> que realmente <em className="not-italic underline decoration-lime decoration-4 underline-offset-4">funciona para ti.</em>
            </h2>
            <p className="text-lg lg:text-xl text-dark/80 leading-relaxed">
              Olvídate de las dietas genéricas y los consejos que no aplican a tu vida. Tu cuerpo es único, y tu alimentación también debería serlo.
            </p>
            <p className="text-lg lg:text-xl text-dark/80 leading-relaxed">
              <strong>Ahí es donde entro yo.</strong> Creo planes nutricionales personalizados que se adaptan a tus gustos, horarios y objetivos. Sin restricciones extremas, solo cambios sostenibles que transforman tu vida.
            </p>
            <Link href="#servicios" className="inline-flex items-center gap-2 nav-link text-dark hover:text-lime transition-colors group">
              <span className="border-b-2 border-dark group-hover:border-lime">CONOCE MIS SERVICIOS</span>
              <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </div>
          
          {/* Decorative Visual */}
          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 bg-sage/30 rounded-full absolute -top-10 -left-10"></div>
              <div className="w-48 h-48 lg:w-64 lg:h-64 bg-lime/20 rounded-full absolute bottom-0 right-0"></div>
              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl">
                <p className="script-text text-4xl lg:text-5xl text-dark text-center leading-relaxed">
                  Tu bienestar<br />es mi<br />prioridad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="bg-cream py-20 lg:py-32 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="script-text text-4xl lg:text-6xl text-dark mb-4">
              Últimas publicaciones
            </h2>
            <p className="text-lg lg:text-xl text-dark/80 max-w-2xl mx-auto">
              Descubre consejos, recetas y tips de nutrición para transformar tu bienestar
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-dark/60">Cargando publicaciones...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark/60">No hay publicaciones disponibles aún.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {posts.slice(0, 3).map((post) => {
                const imageUrl = post.image
                  ? urlFor(post.image)?.width(600).height(400).url()
                  : null;
                
                return (
                  <Link
                    key={post._id}
                    href={`/${post.slug.current}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    {imageUrl && (
                      <div className="relative w-full h-64 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.map((category, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-lime/20 text-dark text-xs px-3 py-1 rounded-full nav-link"
                            >
                              {category.title}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="display-text text-xl lg:text-2xl text-dark group-hover:text-lime transition-colors mb-2">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block bg-dark text-cream px-8 py-4 rounded-full nav-link hover:bg-lime hover:text-dark transition-all shadow-lg"
              >
                VER TODAS LAS PUBLICACIONES
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-lime py-20 lg:py-32 px-6 lg:px-20 relative overflow-hidden">
        {/* Marquee */}
        <div className="absolute top-0 left-0 right-0 bg-dark py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-cream text-sm mx-8 nav-link">
                CAMBIA TUS HÁBITOS ✿ AGENDA HOY ✿ TRANSFORMA TU VIDA ✿
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center pt-12">
          <h2 className="script-text text-4xl lg:text-6xl text-dark mb-4">
            ¿Lista para el cambio?
          </h2>
          <h3 className="display-text text-4xl lg:text-7xl text-dark mb-8 leading-tight">
            TU MEJOR VERSIÓN<br />
            <span className="text-cream">EMPIEZA HOY</span><br />
            CON UNA SIMPLE<br />
            <span className="text-cream">DECISIÓN</span>
          </h3>
          <Link 
            href="/agendar"
            className="inline-block bg-dark text-cream px-10 py-5 rounded-full nav-link text-lg hover:bg-cream hover:text-dark transition-all shadow-xl"
          >
            AGENDA TU CONSULTA GRATIS
          </Link>
          <p className="script-text text-xl text-dark mt-6">
            Sin compromiso. Solo una conversación sobre tus metas.
          </p>
        </div>

      </section>

      {/* Footer */}
      <footer className="bg-dark py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo */}
            <div className="md:col-span-2">
              <div className="inline-block bg-lime/20 rounded-full px-6 py-3 mb-6">
                <span className="display-text text-xl text-cream">
                  Majo<span className="font-normal italic mx-1">Alonzo</span>
                </span>
              </div>
              <p className="text-cream/60 max-w-sm">
                Nutricionista certificada especializada en planes personalizados para transformar tu relación con la comida.
              </p>
            </div>

            {/* Menu */}
            <div>
              <h4 className="nav-link text-cream mb-4 text-sm">MENÚ</h4>
              <ul className="space-y-3">
                {[
                  { label: "Inicio", href: "/" },
                  { label: "Sobre Mí", href: "/sobre-mi" },
                  { label: "Servicios", href: "/servicios" },
                  { label: "Testimonios", href: "/testimonios" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-cream/60 hover:text-lime transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="nav-link text-cream mb-4 text-sm">SÍGUEME</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-cream/60 hover:text-lime transition-colors">Instagram</a>
                </li>
                <li>
                  <a href="#" className="text-cream/60 hover:text-lime transition-colors">TikTok</a>
                </li>
                <li>
                  <a href="#" className="text-cream/60 hover:text-lime transition-colors">YouTube</a>
                </li>
                <li>
                  <a href="#" className="text-cream/60 hover:text-lime transition-colors">WhatsApp</a>
                </li>
      </ul>
            </div>
          </div>

          <div className="border-t border-cream/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/40 text-sm">
              © 2024 Majo Nutrición. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link href="/terminos" className="text-cream/40 text-sm hover:text-cream transition-colors">Términos</Link>
              <Link href="/privacidad" className="text-cream/40 text-sm hover:text-cream transition-colors">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll Button */}
      <button 
        className="fixed bottom-8 right-8 bg-lime text-dark p-4 rounded-full shadow-xl hover:bg-cream transition-colors z-50 group"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-cream z-[100] flex flex-col items-center justify-center gap-8">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-dark"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {[
            { label: "INICIO", href: "/" },
            { label: "SOBRE MÍ", href: "/sobre-mi" },
            { label: "SERVICIOS", href: "/servicios" },
            { label: "PRODUCTOS", href: "/productos-recomendados" },
            { label: "TESTIMONIOS", href: "/testimonios" },
            { label: "CONTACTO", href: "/contacto" },
          ].map((item) => (
            <Link 
              key={item.label}
              href={item.href} 
              className="display-text text-4xl text-dark hover:text-lime transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
