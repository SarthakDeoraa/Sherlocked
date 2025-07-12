const rules = [
  "Each team can have up to 4 members.",
  "No use of external help or internet search.",
  "Hints will be provided at certain intervals.",
  "The team with the highest score wins.",
  "In case of a tie, the fastest team wins.",
  "Respect all participants and organizers.",
  "No use of external help or internet search.",
  "Hints will be provided at certain intervals.",
  "The team with the highest score wins.",
  "In case of a tie, the fastest team wins.",
  "Respect all participants and organizers.",
];

export default function RulesSection() {
  return (
    <section
      id="rules"
      className="py-8 md:py-16 px-4 flex flex-col justify-center items-center"
    >
      <div className="text-center mb-8 md:mb-12">
        <h2 className="font-vonca text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Rules
        </h2>
        <p className="font-vonca text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
          Discover the thrill of solving mysteries in our immersive cryptic hunt
          experience
        </p>
      </div>
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-8 lg:p-12 flex flex-col justify-center items-center min-h-[400px] md:min-h-[500px]">
        <div className="space-y-4 md:space-y-6 w-full">
          <ol className="space-y-3 md:space-y-4 text-gray-300 w-full max-w-md mx-auto">
            {rules.map((rule, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3"
              >
                <span className="flex-shrink-0">
                  <span className="inline-block bg-white/20 text-white font-semibold rounded-full px-3 md:px-4 py-1 text-xs md:text-sm text-center">
                    Rule {idx + 1}
                  </span>
                </span>
                <span className="font-vonca text-sm md:text-lg leading-relaxed">
                  {rule}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
