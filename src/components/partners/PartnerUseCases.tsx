import Link from "next/link";
import type { DemoPartner } from "@/lib/partners/partner-types";

interface PartnerUseCasesProps {
  partners: DemoPartner[];
}

export function PartnerUseCases({ partners }: PartnerUseCasesProps) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Who it is for</p>
          <h2>Для кого нужен partner flow</h2>
        </div>
        <div className="grid-3">
          {partners.map((partner) => (
            <Link href={partner.href} className="card partner-card-link" key={partner.id}>
              <span className="card-number">{partner.id}</span>
              <h3>{partner.title}</h3>
              <p>{partner.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
