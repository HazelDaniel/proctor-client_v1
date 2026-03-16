import { motion } from "framer-motion";

export const Testimonials = () => (
  <section className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-5xl font-bold tracking-tight mb-4">Loved by builders</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: "Alice M.", role: "Frontend Lead", text: "proctor changed how we ship. The developer experience is unmatched.", imageUrl: "/images/emoji_student_1.png" },
          { name: "Bob S.", role: "CTO", text: "We moved our entire collaboration suite to proctor and everything has been better since.", imageUrl: "/images/emoji_student_2.png" },
          { name: "Charlie D.", role: "Indie Hacker", text: "I can finally focus on planning-to-product workflow in a single place instead of using 10 different tools.", imageUrl: "/images/emoji_student_2.png" },
        ].map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            data-aos="fade-up"
            data-aos-delay={i * 100}
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-150 cursor-default  ring-muted ring-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
