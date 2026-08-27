import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

/** Source renders these as an icon list with 14px green icons and 18px Halyard text. */
export function ContactDetails({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-2.5", className)}>
      <li className="flex items-center gap-2.5 text-lg font-medium text-white max-md:justify-center max-md:text-sm">
        <Mail size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span>
          Email:{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="transition-colors duration-300 hover:text-primary"
          >
            {siteConfig.email}
          </a>
        </span>
      </li>
      <li className="flex items-center gap-2.5 text-lg font-medium text-white max-md:justify-center max-md:text-sm">
        <Phone size={16} className="shrink-0 text-primary" aria-hidden="true" />
        <span>
          Phone:{" "}
          <a
            href={siteConfig.phoneHref}
            className="transition-colors duration-300 hover:text-primary"
          >
            {siteConfig.phone}
          </a>
        </span>
      </li>
    </ul>
  );
}
