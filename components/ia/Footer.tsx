"use client";

// Footer markup mirrors insideadviser.com.au so the synced theme CSS styles it
import { useState } from "react";
import site from "@/config/site.json";
import { LinkedInIcon, YouTubeIcon } from "./icons";

type Link = { label: string; href: string; external?: boolean };

function Column({ id, title, links }: { id: string; title: string; links: Link[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="footer-navigation__right--column">
      <div className="footer-collapse">
        <button className="footer-collapse__toggle collapsed d-none d-lg-block" type="button" tabIndex={-1}>
          <span>{title}</span>
        </button>
        <button
          className={`footer-collapse__toggle d-lg-none${open ? "" : " collapsed"}`}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{title}</span>
          <span className="footer-collapse__icon" />
        </button>
        <div id={id} className={`footer-collapse__content collapse${open ? " show" : ""}`}>
          <ul className="ul sidebar-accordion-list">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="sidebar-accordion-link" {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="site-footer" className="site-footer">
      <div className="container">
        <div className="footer-newsletter">
          <div className="row">
            <div className="col-lg-5">
              <div className="footer-newsletter__left">
                <p className="stay-informed">Stay <i>informed</i></p>
                <p className="newsletter-description">Sign up for our newsletter and be the first to know.</p>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="footer-newsletter__right">
                <div className="row cta-subscrible">
                  <div className="col-lg-12">
                    <a className="btn btn-secondary btn-submit" href={site.subscribe}>Subscribe</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-navigation">
          <div className="footer-navigation__left">
            <a href={site.parentUrl} className="site-logo">
              <img src={`${site.assets}/the-inside-adviser.svg`} alt={`${site.parentName} Logo`} className="img-fluid" />
            </a>
            <p className="logan">{site.about_text}</p>
            <div className="footer-navigation__social">
              <a href={site.social.youtube} className="social-link" target="_blank" rel="noopener noreferrer" aria-label={`${site.parentName} on YouTube`}>
                <YouTubeIcon />
              </a>
              <a href={site.social.linkedin} className="social-link" target="_blank" rel="noopener noreferrer" aria-label={`${site.parentName} on LinkedIn`}>
                <LinkedInIcon />
              </a>
            </div>
          </div>
          <div className="footer-navigation__right">
            <Column id="footerExplore" title="Explore" links={site.menu} />
            <Column id="footerAbout" title="About" links={site.about} />
            <Column id="footerPartners" title="Our Network" links={site.network.map((n) => ({ ...n, external: true }))} />
          </div>
        </div>
        <div className="footer-copyright">
          <p className="copyright-text">{site.copyright} {new Date().getFullYear()} &copy; All rights reserved.</p>
          <p className="terms-text mb-0">
            {site.disclaimer}{" "}
            {site.legal.map((l) => <a key={l.label} href={l.href}>{l.label}</a>).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, " ", el] : [el]), [])}
          </p>
        </div>
      </div>
    </footer>
  );
}
