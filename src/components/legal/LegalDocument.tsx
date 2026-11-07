export type LegalSection = {
  title: string
  body: string[]
}

type LegalDocumentProps = {
  title: string
  lastUpdated?: string
  sections: LegalSection[]
}

export function LegalDocument({ title, lastUpdated, sections }: LegalDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-10 text-[var(--foreground)] xl:px-8 xl:py-16">
      <header className="border-b border-[var(--border)] pb-6 xl:pb-8">
        <h1 className="text-3xl font-semibold tracking-tight xl:text-4xl">{title}</h1>
        {lastUpdated && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{lastUpdated}</p>}
      </header>

      <div className="space-y-8 pt-8 xl:space-y-10 xl:pt-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold xl:text-2xl">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--muted-foreground)] xl:text-base">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
