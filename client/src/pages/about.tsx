export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-8 text-center">
            About Atlantic Weizard
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Atlantic Weizard was born from a singular vision: to redefine luxury menswear for the modern era. We believe that true style is not about following trends, but about expressing timeless elegance with contemporary confidence.
            </p>

            <h2 className="font-serif text-3xl font-bold text-foreground mt-12 mb-6">
              Our Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In a world of fast fashion and disposable trends, we stand for something different. Each piece in our collection is selected with meticulous attention to craftsmanship, quality, and design. We partner with the world's finest manufacturers and artisans who share our commitment to excellence.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our name, Atlantic Weizard, represents the confluence of classic European sophistication (Atlantic) and modern innovation (Weizard). Like the ocean itself, we are both timeless and ever-evolving.
            </p>

            <h2 className="font-serif text-3xl font-bold text-foreground mt-12 mb-6">
              The Collection
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every item in the Atlantic Weizard collection tells a story. From impeccably tailored overcoats to the finest leather accessories, each piece is chosen to be more than just clothing—it's an investment in your personal narrative.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We curate, we don't just sell. Our team travels the world seeking out exceptional pieces that meet our exacting standards. If it doesn't embody our values of quality, craftsmanship, and timeless design, it doesn't make it into our collection.
            </p>

            <h2 className="font-serif text-3xl font-bold text-foreground mt-12 mb-6">
              Our Commitment
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We're committed to providing not just exceptional products, but an exceptional experience. From our carefully designed packaging to our personalized customer service, every touchpoint reflects our dedication to luxury.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is more than a store. It's a destination for those who understand that true luxury is found in the details, in the quality, in the story behind each piece.
            </p>

            <div className="bg-card p-8 rounded-md mt-12 border border-card-border">
              <p className="text-lg text-card-foreground font-medium italic text-center">
                "Luxury is in each detail, quality over quantity, timelessness over trends."
              </p>
              <p className="text-center text-muted-foreground mt-2">— Atlantic Weizard</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
