import Image from "next/image";

export const metadata = {
  title: "Welcome . Nicho Halloween Festival",
  description:
    "A word from the principal of Nicholson Street Public School on the Nicho Halloween Festival.",
};

// Copy supplied by Gemma as a Word document, 19 August 2026. Paragraph breaks
// are reproduced exactly as written. Two lines are set in the display font at
// Gemma's request: the Nicho Way motto and the closing question.
const PARAGRAPHS = [
  "The Nicho Halloween Festival is deeply woven into the fabric of our school’s culture and community. For more than 30 years, this much-loved tradition has brought generations of Nicho families, students, staff and friends together for a celebration filled with fun, creativity and community spirit.",
  "It is a festival that we, as staff, genuinely look forward to each year. Over the years, many staff members have embraced the excitement by dressing up, becoming tombola witches and wizards, casting spells, drinking slime and joining wholeheartedly in the magic of Halloween!",
  "More importantly, the festival demonstrates the true power of the Nicho spirit. It showcases what we can achieve as a small and mighty school when we work together in service of our students. It is truly remarkable to witness our parent community unite, volunteer countless hours and contribute their creativity, energy and expertise to bring this extraordinary event to life.",
  "On behalf of all Nicho staff, I express our deepest gratitude and profound appreciation to every person who contributes.",
  "The festival celebrates the importance of belonging and community while raising vital funds that are invested directly back into our school.",
  "As a small school, we rely heavily on the generosity and commitment of our community to help Nicho continue to grow and thrive. Funds raised through the festival support playground and classroom resources, enhance our learning environments and provide greater opportunities for individualised learning that benefits every student.",
];

const BODY = "font-body text-lg md:text-xl text-ink-soft leading-relaxed mb-6";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 md:py-20">
        {/* Header */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-rust-deep mb-3">
            Welcome
          </p>
          <h1 className="font-display font-bold text-5xl md:text-7xl text-ink tracking-tight leading-[1.02]">
            A word from our principal
          </h1>
        </div>

        {/* Plain block, not flex: the polaroid floats and the paragraphs wrap
            around it, which closes the gap the two-column header left behind. */}
        <div className="max-w-[980px]">
          {/* Floated right from md up. Below that it stacks full width, since
              text wrapping around a picture on a 390px screen leaves columns
              too narrow to read. */}
          <div className="mb-8 md:mb-4 md:float-right md:ml-12 md:w-[420px] flex justify-center">
            <div className="-rotate-2 bg-bone p-4 pb-14 shadow-[4px_8px_24px_rgba(26,26,26,0.3),2px_3px_6px_rgba(26,26,26,0.15)] max-w-[420px] w-full">
              <Image
                src="/images/lucy/1E5A3875.jpeg"
                alt="Lucy Norrish, Principal of Nicholson Street Public School"
                width={5106}
                height={5106}
                priority
                className="w-full h-auto"
              />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-moss text-center mt-3">
                Principal Lucy Norrish
              </p>
            </div>
          </div>

          {PARAGRAPHS.slice(0, 4).map((p) => (
            <p key={p.slice(0, 40)} className={BODY}>
              {p}
            </p>
          ))}

          {PARAGRAPHS.slice(4).map((p) => (
            <p key={p.slice(0, 40)} className={BODY}>
              {p}
            </p>
          ))}

          {/* Ends with the motto, which Gemma wants in the display face. */}
          <p className={BODY}>
            Thank you to all Nicho parents, carers, families, volunteers and
            supporters for consistently going above and beyond for our amazing
            students. Your generosity, teamwork and unwavering commitment embody
            our Nicho Way philosophy:
          </p>
          <p className="font-display font-bold text-4xl md:text-6xl text-ink leading-tight mb-10">
            One In, All In.
          </p>

          <p className={BODY}>
            I am incredibly excited for the 2026 Nicho Halloween Festival and
            cannot wait to experience the magic with you all.
          </p>

          <p className="clear-both font-display font-bold text-3xl md:text-5xl text-rust leading-tight mt-10">
            The only question remaining is: who are you dressing up as this
            year?
          </p>
        </div>
      </div>
    </main>
  );
}
