const SECTIONS = [
  {
    label: "Getting here",
    faqs: [
      {
        q: "How do I get to Nicholson Street Public School?",
        a: "We're at 23 Nicholson Street, Balmain East. The 442 bus runs from QVB to Balmain East Ferry Wharf. Ferries dock at Balmain East Wharf, then it's a five-minute walk up to the school. Street parking is limited and timed. There's no light rail or train.",
      },
      {
        q: "What if it rains?",
        a: "The Nicho Halloween Festival is an all-weather event and has run every year except during COVID. In the unlikely event of cancellation we'll post on this site and on the school Facebook page.",
      },
      {
        q: "Is the venue accessible?",
        a: "Yes, the festival is an accessible event. Most attractions are stroller and wheelchair accessible. A small number sit at the top of stairs. The site map shows accessible routes.",
      },
    ],
  },
  {
    label: "Tokens and paying",
    faqs: [
      {
        q: "What are tokens?",
        a: "Tokens are how you pay for everything at the festival. Attractions, food, drinks, games, the lot. No cash exchanges hands at any stall. Most attractions cost 2 to 5 tokens. You buy tokens at the door (cash or card via Square), or pre-purchase online and save 15%.",
      },
      {
        q: "Why pre-purchase tokens online?",
        a: "You save 15% off the festival-day price, and you skip the queue at the token booth. Pre-purchase closes at midnight on the day before the festival.",
      },
      {
        q: "How do I collect my pre-purchased tokens?",
        a: "Bring your confirmation email to the Token Booth at the festival entrance on the day. We'll find your order, hand you the matching number of physical tokens, and you're off. Refunds are only available if the festival is cancelled. Tokens aren't redeemable for cash.",
      },
      {
        q: "Can I buy tokens on the day?",
        a: "Yes. The Token Booth opens at 3pm and runs throughout the festival. Pay by cash or card. Day-of pricing is the full price (the 15% pre-purchase discount only applies online).",
      },
    ],
  },
  {
    label: "On the day",
    faqs: [
      {
        q: "What's age-appropriate?",
        a: "Most attractions are suitable from age 4 up. The Haunted House has gentle scares suitable for ages 5+. The Mini Monsters zone is dedicated to under-5s with age-appropriate games and craft.",
      },
      {
        q: "Are there food allergies catered for?",
        a: "All food at the festival has allergen labelling. The kitchen handles common allergens (gluten, dairy, nuts) but cross-contamination is possible in a busy festival kitchen, so we can't guarantee allergen-free food. Bring backups for severe allergies.",
      },
      {
        q: "Are dogs welcome?",
        a: "We love dogs but the festival isn't dog-friendly. Crowds, queues, and small children in costume aren't a great combination for most pets. Assistance dogs are always welcome.",
      },
    ],
  },
  {
    label: "Safety and privacy",
    faqs: [
      {
        q: "What if my child gets lost?",
        a: "We have a designated Lost & Found tent (marked on the site map) staffed throughout the festival. Lost children are taken there immediately and announcements made over the PA. Brief your child to find a volunteer (we'll be in high-vis vests).",
      },
      {
        q: "Will there be photography?",
        a: "Yes, we'll have a photographer on site. By attending the festival you're consenting to incidental photography for festival promotion. If you'd prefer your child not be photographed, let a volunteer know on the day and we'll make a note.",
      },
      {
        q: "Can I volunteer?",
        a: "Yes please! Email hello@nichohalloween.com.au or sign up via the school P&C.",
      },
    ],
  },
];

// Images placed between sections as polaroid breaks
const PHOTO_BREAKS = [
  { src: "/skeleton.jpg", caption: "Keeping watch since 1989", rotate: "-rotate-2", position: "justify-end" },
  { src: "/snackshappytom.jpg", caption: "Fairy floss. Popcorn. Sorted.", rotate: "rotate-1", position: "justify-start" },
  { src: "/scene2.jpg", caption: "The schoolyard, transformed", rotate: "-rotate-1", position: "justify-center" },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero: header left, skeleton polaroid right */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-14">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2">
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-rust-deep mb-3">
              Before you go
            </p>
            <h1 className="font-display font-bold text-6xl md:text-7xl text-ink mb-4 tracking-tight leading-none">
              Questions?<br />Answered.
            </h1>
            <p className="font-body text-xl text-ink-soft max-w-lg">
              Everything you need to know about getting here, paying for things,
              and keeping the little ones safe. If your question isn&apos;t here,
              email us at hello@nichohalloween.com.au.
            </p>
          </div>

          {/* Fairy floss kid polaroid */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="rotate-2 bg-bone p-4 pb-14 shadow-[4px_8px_24px_rgba(26,26,26,0.3),2px_3px_6px_rgba(26,26,26,0.15)] max-w-[320px]">
              <img
                src="/snackshappytom.jpg"
                alt="Happy kid with fairy floss and popcorn at the festival"
                className="w-full aspect-[3/4] object-cover"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                Fairy floss. Popcorn. Sorted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ sections with photo breaks */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 -mt-2 pb-20">
        <div className="max-w-3xl">
          {SECTIONS.map((section, si) => (
            <div key={section.label}>
              {/* Section header */}
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-rust-deep mb-6 mt-4">
                {section.label}
              </p>

              {/* Accordion FAQs */}
              <div className="space-y-0 mb-12">
                {section.faqs.map((faq, fi) => (
                  <details
                    key={fi}
                    className="group border-b border-dotted border-mist"
                  >
                    <summary className="flex items-start justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <h2 className="font-display text-2xl md:text-3xl text-ink tracking-wide leading-tight group-hover:text-rust transition-colors">
                        {faq.q}
                      </h2>
                      <span className="font-display text-2xl text-mist mt-1 flex-shrink-0 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="font-body text-lg text-ink-soft leading-relaxed pb-6 pr-8">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>

              {/* Photo break after first two sections */}
              {si === 0 && (
                <div className="flex justify-center my-14">
                  <div className="-rotate-1 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[600px] w-full">
                    <img
                      src="/scene9.jpg"
                      alt="Festival scene"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                      The schoolyard, transformed
                    </p>
                  </div>
                </div>
              )}

              {si === 1 && (
                <div className="flex justify-start my-14">
                  <div className="rotate-1 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[320px]">
                    <img
                      src="/scene7.jpg"
                      alt="Festival fun"
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                      Every year, rain or shine
                    </p>
                  </div>
                </div>
              )}

              {si === 2 && (
                <div className="flex flex-col sm:flex-row gap-8 my-14 items-start">
                  <div className="rotate-1 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[300px]">
                    <img
                      src="/skeleton.jpg"
                      alt="Skeleton in a peacock chair"
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                      Keeping watch since 1989
                    </p>
                  </div>
                  <div className="-rotate-1 bg-bone p-4 pb-14 shadow-[3px_5px_16px_rgba(26,26,26,0.18),1px_2px_4px_rgba(26,26,26,0.1)] max-w-[500px] w-full mt-6">
                    <img
                      src="/scene8.jpg"
                      alt="School grounds with Sydney Harbour Bridge in the background"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                      Balmain East. Harbour Bridge next door.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
