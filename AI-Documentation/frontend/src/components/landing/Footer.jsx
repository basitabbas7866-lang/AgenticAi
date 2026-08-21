import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useReveal } from "../../hooks/useReveal";

function Footer() {
  const ref = useReveal();

  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Security Standards", href: "#security" }
  ];

  const supportLinks = [
    { name: "Support Center", href: "#support" },
    { name: "Contact Team", href: "#contact-form" },
    { name: "System Status", href: "#status" }
  ];

  return (
    <footer
      className="pt-20 pb-8 border-t border-slate-950"
      style={{ background: "#020617" }}
      id="contact"
    >
      <div className="max-w-[1320px] mx-auto px-6 lp-reveal" ref={ref}>

        {/* Main Grid: 3 Columns with a Heavy Left Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 pb-16">

          {/* Column 1 (Left 6-Span Column): Brand block & Social Inline Row */}
          <div className="md:col-span-6 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-indigo-500 to-cyan-400 rotate-45" />
                <h4 className="font-sans font-black text-white text-xl tracking-tight">
                  ClarityNote <span className="text-cyan-400 font-medium">AI</span>
                </h4>
              </div>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Secure, AI-powered medical documentation platform converting natural clinical conversations into structure-perfect notes.
              </p>
            </div>

            {/* Social channels sit grouped comfortably directly beneath description */}
            <div className="flex gap-2.5">
              {[
                { icon: <FaGithub className="text-base" />, label: "GitHub", href: "https://github.com" },
                { icon: <FaTwitter className="text-base" />, label: "Twitter", href: "https://twitter.com" },
                { icon: <FaLinkedin className="text-base" />, label: "LinkedIn", href: "https://linkedin.com" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl
                    text-slate-400 bg-slate-900 border border-white/[0.04]
                    hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/30
                    hover:-translate-y-0.5 transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 (Right 3-Span Column): Legal Links Group */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h5 className="text-white text-xs font-bold uppercase tracking-[0.15em] text-slate-200">
              Trust &amp; Legal
            </h5>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group inline-flex text-slate-400 font-medium text-sm no-underline hover:text-white transition-colors duration-200"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 (Right 3-Span Column): Support Links Group */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h5 className="text-white text-xs font-bold uppercase tracking-[0.15em] text-slate-200">
              Resources
            </h5>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group inline-flex text-slate-400 font-medium text-sm no-underline hover:text-white transition-colors duration-200"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start">
            <span>&copy; {new Date().getFullYear()} ClarityNote AI.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Designed for healthcare practitioners worldwide.</span>
          </div>

          <div className="text-slate-600 text-[11px] bg-slate-950/60 px-3 py-1 rounded-md border border-white/[0.02]">
            HIPAA Compliant Architecture
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;