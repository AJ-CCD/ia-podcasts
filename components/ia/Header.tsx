"use client";

// Header markup mirrors insideadviser.com.au so the synced theme CSS
// (styles/ia-theme.css) styles it. Their theme JS toggles the same classes.
import { useEffect, useRef, useState } from "react";
import site from "@/config/site.json";
import AdSlot from "@/components/AdSlot";
import { CloseIcon, SearchIcon } from "./icons";

const logo = `${site.assets}/the-inside-adviser.svg`;

type Item = { label: string; href: string; current?: boolean; external?: boolean };

const MenuLinks = ({ liClass = "" }: { liClass?: string }) => (
  <>
    {(site.menu as Item[]).map((m) => (
      <li key={m.label} className={`menu-item${m.current ? " current-menu-item" : ""}${liClass ? ` ${liClass}` : ""}`}>
        <a
          href={m.href}
          aria-current={m.current ? "page" : undefined}
          {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m.label}
        </a>
      </li>
    ))}
  </>
);

function SearchBox({ id, active, onClose }: { id: string; active?: boolean; onClose?: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (active) input.current?.focus(); }, [active]);
  return (
    <div id={id} className={`search-overlay${active ? " active" : ""}`} role="search" aria-label="Site search">
      <div className="container">
        <form className="search-box position-relative" action={site.parentUrl + "/"} method="get">
          <label className="visually-hidden" htmlFor={`${id}-input`}>Search {site.parentName}</label>
          <input
            ref={input}
            type="text"
            name="s"
            id={`${id}-input`}
            className="form-control"
            placeholder={`Search ${site.parentName}`}
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
          />
          <button
            type="button"
            className="clear-btn"
            aria-label="Clear search"
            style={q ? { display: "flex" } : undefined}
            onClick={() => { setQ(""); input.current?.focus(); }}
          >
            <CloseIcon size={29} />
          </button>
        </form>
      </div>
    </div>
  );
}

const Ribbon = ({ className = "" }: { className?: string }) => (
  <div className={`site-ribbon ${className}`.trim()}>
    <div className="site-ribbon-inner">
      <div className="container">
        <div className="ribbon-content d-none d-lg-flex align-items-center justify-content-between">
          <div className="d-inline-flex justify-content-between align-items-center mx-auto">
            <span className="stay-informed">Stay <i>informed</i></span>
            <span className="ribbon-text">Sign up for our newsletter and be the first to know.</span>
            <a className="subscribe-modal subscribe" href={site.subscribe}>Subscribe</a>
          </div>
        </div>
        <div className="ribbon-content d-lg-none">
          <div className="d-flex f-500 justify-content-center align-items-center">
            <a className="subscribe-modal ribbon-text" href={site.subscribe}>Sign up for our newsletter <i>now</i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const main = useRef<HTMLElement>(null);

  // Compact header slides in once the large masthead scrolls out of view
  useEffect(() => {
    const el = main.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("search-overlay-active", searchOpen);
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setSearchOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = () => {
    setMenuOpen(false);
    // The search panel lives in the compact header, which is shown while it is open
    setSearchOpen((v) => !v);
  };

  return (
    <>
      <div className="print-site-logo" aria-hidden="true">
        <img src={logo} alt={site.parentName} className="print-site-logo__img img-fluid" width={200} height={40} />
      </div>

      <div className={`header-wrapper${sticky || searchOpen ? " is-visible" : ""}`}>
        <div className="header-up">
          <header className="site-header py-2">
            <div className="container d-flex align-items-center justify-content-between">
              <div className="header-left d-flex align-items-center">
                <button type="button" className="menu-toggle" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
                  <img src={`${site.assets}/menu-toggle.svg`} alt="" className="img-fluid" width={24} height={24} />
                </button>
                <a href={site.parentUrl} className="site-logo">
                  <img src={logo} alt={`${site.parentName} Logo`} className="img-fluid" />
                </a>
              </div>
              <div className="header-right d-flex align-items-center d-none d-lg-flex">
                <ul className="ul main-menu"><MenuLinks /></ul>
                <button type="button" className="search-toggle" aria-label="Open search" aria-expanded={searchOpen} onClick={openSearch}>
                  <SearchIcon />
                </button>
              </div>
            </div>
          </header>
          <SearchBox id="searchOverlayMain" active={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
        <Ribbon />
      </div>

      <div id="sidebarMenu" className={`sidebar-menu${menuOpen ? " active" : ""}`} aria-hidden={!menuOpen}>
        <div className="sidebar-header d-flex align-items-center">
          <button type="button" id="sidebarClose" className="btn-close-menu" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
          <a href={site.parentUrl} className="site-logo d-xl-none">
            <img src={logo} alt={`${site.parentName} Logo`} className="img-fluid" />
          </a>
          <button type="button" className="search-toggle d-none d-xl-block" aria-label="Open search" onClick={openSearch}>
            <SearchIcon />
          </button>
        </div>
        <Ribbon className="relative d-xl-none" />
        <SearchBox id="searchOverlaySidebar" />
        <nav className="sidebar-nav">
          <ul className="list-unstyled"><MenuLinks liClass="h2" /></ul>
          <div className="accordion" id="sidebarAccordion">
            <SidebarGroup title="ABOUT">
              <ul className="ul sidebar-accordion-list">
                {site.about.map((a) => (
                  <li key={a.label}>
                    <a href={a.href} className="sidebar-accordion-link" {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{a.label}</a>
                  </li>
                ))}
              </ul>
            </SidebarGroup>
            <SidebarGroup title="OUR NETWORK">
              <ul className="ul sidebar-partners-list">
                {site.network.map((n) => (
                  <li key={n.label} className="sidebar-partner-logo">
                    <a href={n.href} target="_blank" rel="noopener noreferrer">
                      <img src={`${site.assets}/${n.logo}`} alt={n.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </SidebarGroup>
          </div>
        </nav>
      </div>

      <div id="searchBackground" className={`search-background${searchOpen ? " active" : ""}`} onClick={() => setSearchOpen(false)} />
      <div id="sidebarOverlay" className={`sidebar-overlay${menuOpen ? " active" : ""}`} onClick={() => setMenuOpen(false)} />

      <section className="header-billboard">
        <div className="container">
          <AdSlot name="billboard" />
        </div>
      </section>

      <Ribbon className="relative side-ribbon-content" />

      <section id="headerMainSwitch" className="header-main" ref={main}>
        <div className="container">
          <div className="header-main__up">
            <a href={site.parentUrl} className="site-logo">
              <img src={logo} alt={`${site.parentName} Logo`} className="img-fluid" />
            </a>
            <div className="header-right align-items-center">
              <span className="header-date">{site.tagline}</span>
              <a className="subscribe-modal subscribe" href={site.subscribe}>Subscribe</a>
              <button type="button" className="search-toggle" aria-label="Open search" onClick={openSearch}>
                <SearchIcon />
              </button>
            </div>
          </div>
          <div className="header-main__down">
            <nav className="header-main__nav">
              <ul className="ul main-menu"><MenuLinks /></ul>
            </nav>
            <div className="header-main__down--right d-flex align-items-center">
              <span>Part of The Inside Network</span>
              <img src={`${site.assets}/in.svg`} width={20} height={15} alt="The Inside Network" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item sidebar-accordion-item">
      <h2 className="accordion-header sidebar-accordion-header">
        <button
          className={`accordion-button sidebar-accordion-button${open ? "" : " collapsed"}`}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sidebar-accordion-title">{title}</span>
        </button>
      </h2>
      <div className={`accordion-collapse collapse sidebar-accordion-collapse${open ? " show" : ""}`}>
        <div className="accordion-body sidebar-accordion-body">{children}</div>
      </div>
    </div>
  );
}
