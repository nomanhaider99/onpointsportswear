import Image from "next/image";
import Link from "next/link";
import { footerLegalLinks, footerQuickLinks, footerServiceLinks } from "@/data/navigation";
import { siteConfig } from "@/data/site";
import { FacebookIcon, InstagramIcon, XIcon } from "./SocialIcons";

/** The source markup renders these three icons without hrefs; they stay inert until accounts exist. */
const socialLinks = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "X", href: "#", Icon: XIcon },
];

const columnHeading = "text-xs font-bold uppercase text-primary";
const columnLink =
  "text-sm text-white/80 transition-colors duration-300 hover:text-primary";

export function Footer() {
  return (
    <footer className="bg-[#0a1649] py-[50px]">
      <div className="container-site">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" aria-label="On Point Sportswear - home">
              <Image
                src="/images/logo.png"
                alt="On Point Sportswear"
                width={131}
                height={87}
                className="h-auto w-[110px]"
              />
            </Link>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              {siteConfig.footerBlurb.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className={columnHeading}>Quick Links</h2>
            <ul className="mt-4 space-y-2.5">
              {footerQuickLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={columnLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnHeading}>Services</h2>
            <ul className="mt-4 space-y-2.5">
              {footerServiceLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={columnLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={columnHeading}>Social</h2>
            <ul className="mt-4 flex items-center gap-2.5">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="block rounded-full transition-opacity duration-300 hover:opacity-70"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-[15px] border-t border-white/10" />

        <div className="flex flex-col items-center justify-between gap-3 font-[family-name:var(--font-inter)] text-[13px] text-white/80 sm:flex-row">
          <a
            href={siteConfig.credit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-primary"
          >
            {siteConfig.credit.label}
          </a>
          <ul className="flex items-center gap-6">
            {footerLegalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors duration-300 hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
