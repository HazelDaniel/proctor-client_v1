export const Showcase = () => (
  <section className="py-24 px-6  border-y border-gray-100 relative">
    <div className="absolute inset-0 z-[10] overflow-hidden pointer-events-none">
      <div
        className="flare-1 absolute w-[5rem] h-[5rem] rounded-full blur-[100px] opacity-80 scale-[3] z-[8]"
        style={{ background: "radial-gradient(circle, #c084fc 0%, transparent 70%)" }}
      ></div>
      <div
        className="flare-1 absolute w-[5rem] h-[5rem] rounded-full blur-[100px] opacity-80 scale-[3]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      ></div>
    </div>

    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Every detail, perfected.</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Experience micro-interactions and seamless workflows that feel instantly familiar yet incredibly fresh.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div data-aos="fade-up" data-aos-delay="100" className="group rounded-2xl p-2 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden relative flex items-center justify-center">
            <img src="/images/demo-2.gif" alt="proctor showcase" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/80 opacity-50 transition-opacity"></div>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Instant Feedback</h3>
            <p className="text-gray-500 text-sm">See your changes live in milliseconds. No more waiting.</p>
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="200" className="group rounded-2xl p-2 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden relative flex items-center justify-center">
            <img src="/images/landing.gif" alt="proctor landing page showcase" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Collaborative Environment</h3>
            <p className="text-gray-500 text-sm">Work together on schema design with tech lead</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
