const faqs = [
  {
    q: "How do I get to Nicholson Street Public School?",
    a: "We're at 23 Nicholson Street, Balmain East. The 442 bus runs from QVB to Balmain East Ferry Wharf. Ferries dock at Balmain East Wharf, then it's a five-minute walk up to the school. Street parking is limited and timed. There's no light rail or train.",
  },
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
  {
    q: "Is the venue accessible?",
    a: "Yes, the festival is an accessible event. Most attractions are stroller and wheelchair accessible. A small number sit at the top of stairs. The site map shows accessible routes.",
  },
  {
    q: "What if it rains?",
    a: "The Nicho Halloween Festival is an all-weather event and has run every year except during COVID. In the unlikely event of cancellation we'll post on this site and on the school Facebook page.",
  },
  {
    q: "Are dogs welcome?",
    a: "We love dogs but the festival isn't dog-friendly. Crowds, queues, and small children in costume aren't a great combination for most pets. Assistance dogs are always welcome.",
  },
  {
    q: "Will there be photography?",
    a: "Yes, we'll have a photographer on site. By attending the festival you're consenting to incidental photography for festival promotion. If you'd prefer your child not be photographed, let a volunteer know on the day and we'll make a note.",
  },
  {
    q: "Are there food allergies catered for?",
    a: "All food at the festival has allergen labelling. The kitchen handles common allergens (gluten, dairy, nuts) but cross-contamination is possible in a busy festival kitchen, so we can't guarantee allergen-free food. Bring backups for severe allergies.",
  },
  {
    q: "What's age-appropriate?",
    a: "Most attractions are suitable from age 4 up. The Haunted House has gentle scares suitable for ages 5+. The Mini Monsters zone is dedicated to under-5s with age-appropriate games and craft.",
  },
  {
    q: "What if my child gets lost?",
    a: "We have a designated Lost & Found tent (marked on the site map) staffed throughout the festival. Lost children are taken there immediately and announcements made over the PA. Brief your child to find a volunteer (we'll be in high-vis vests).",
  },
  {
    q: "Can I volunteer?",
    a: "Yes please! Email volunteers@nichohalloween.com.au or sign up via the school P&C.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-rust-deep mb-2">
          Questions answered
        </p>
        <h1 className="font-display text-5xl md:text-6xl text-ink mb-12">
          FAQ
        </h1>

        <div className="space-y-8">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-mist/50 pb-8">
              <h2 className="font-display text-2xl text-ink mb-3">{faq.q}</h2>
              <p className="font-body text-lg text-ink-soft leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
