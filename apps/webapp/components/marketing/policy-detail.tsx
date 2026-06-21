import Link from "next/link";
import type { Policy } from "@/lib/marketing/policies";

type PolicyDetailProps = {
  policy: Policy;
};

export function PolicyDetail({ policy }: PolicyDetailProps) {
  return (
    <>
      <header className="px-[5%] pt-44 pb-16 md:pb-24 lg:pb-28">
        <div className="container mx-auto max-w-lg text-center">
          <p className="mea-body-md mb-2">{policy.category}</p>
          <h1 className="mea-heading-h2 mb-5 md:mb-6">{policy.title}</h1>
          {policy.crossrefs.length > 0 ? (
            <div className="mt-6">
              <p className="mea-body-md mb-2">Policies Cross-referenced:</p>
              <ul className="flex flex-col gap-1">
                {policy.crossrefs.map((crossref) => (
                  <li key={crossref.url}>
                    <Link
                      href={crossref.url}
                      prefetch={false}
                      className="mea-body-md text-text underline hover:opacity-80"
                    >
                      {crossref.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </header>

      <section className="px-[5%] pb-16 md:pb-24 lg:pb-28">
        <div className="container">
          <div className="mx-auto w-full max-w-lg">
            <div
              className="mea-policy-rich-text"
              dangerouslySetInnerHTML={{ __html: policy.contentHtml }}
            />
            <div className="mt-8 font-semibold">
              <p className="mea-body-md">Adopted by</p>
              <p className="mea-body-md">{policy.adoptedBy}</p>
              <p className="mea-body-md">{policy.adoptedRole}</p>
              <p className="mea-body-md">{policy.adoptedDate}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
