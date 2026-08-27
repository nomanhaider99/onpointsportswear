import Image from "next/image";
import { services, serviceImages, type Service } from "@/data/services";
import { ServiceIcon } from "@/components/ui/ServiceIcon";

function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="h-full rounded-lg border border-border bg-card px-5 py-10 text-center transition-colors duration-300 hover:border-primary md:text-left">
      <div className="flex flex-col gap-[15px] max-md:items-center">
        <ServiceIcon />
        <h3 className="text-xl font-bold uppercase text-white">{service.title}</h3>
        <p className="text-sm text-white/80">{service.description}</p>
      </div>
    </article>
  );
}

function ServiceImage({ image }: { image: { src: string; alt: string; width: number; height: number } }) {
  return (
    <div className="h-full overflow-hidden rounded-lg">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
        className="h-full min-h-[200px] w-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}

/**
 * Source layout - two rows of four cells:
 *   row 1: Custom Jerseys | Sublimation Printing | Embroidery       | image
 *   row 2: Sports Pants   | image                | School Spirit    | Tournament Packages
 */
export function ServicesGrid() {
  const [jerseys, sublimation, embroidery, pants, spirit, tournament] = services;

  return (
    <div className="container-site mt-[25px] space-y-[25px]">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ServiceCard service={jerseys} />
        <ServiceCard service={sublimation} />
        <ServiceCard service={embroidery} />
        <ServiceImage image={serviceImages.rowOne} />
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ServiceCard service={pants} />
        <ServiceImage image={serviceImages.rowTwo} />
        <ServiceCard service={spirit} />
        <ServiceCard service={tournament} />
      </div>
    </div>
  );
}
