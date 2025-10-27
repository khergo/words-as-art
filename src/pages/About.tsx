import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Award } from "lucide-react";

const About = () => {
  const awards = [
    { year: "2024", title: "Cannes Lions Gold", category: "Creative Strategy" },
    { year: "2023", title: "D&AD Pencil", category: "Copywriting" },
    { year: "2023", title: "One Show Gold", category: "Brand Voice" },
    { year: "2022", title: "Webby Award", category: "Best Writing" },
    { year: "2022", title: "Clio Award Silver", category: "Integrated Campaign" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24">
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-serif text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
                About Me
              </h1>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-5 gap-12 mb-20">
                <div className="md:col-span-2">
                  <div className="aspect-[3/4] bg-muted animate-fade-in" />
                </div>

                <div className="md:col-span-3 space-y-6 animate-fade-in-delay">
                  <p className="text-xl leading-relaxed">
                    I'm a creative copywriter and strategist who believes great
                    words can change how people see the world — and themselves.
                  </p>

                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Over the past decade, I've worked with brands like Nike,
                    Spotify, Apple, and Patagonia to create campaigns that don't
                    just sell products — they tell stories, spark movements, and
                    win awards.
                  </p>

                  <p className="text-lg leading-relaxed text-muted-foreground">
                    My approach is simple: understand the human truth, find the
                    unexpected angle, and craft words that feel like they were
                    meant to be said. Whether it's a 15-second film script or a
                    brand manifesto, I write to make people feel something real.
                  </p>

                  <p className="text-lg leading-relaxed text-muted-foreground">
                    When I'm not writing campaigns, you'll find me reading
                    fiction, collecting vintage posters, or arguing that the best
                    ads are the ones you remember without trying.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-16 animate-slide-up">
                <div className="flex items-center gap-3 mb-12">
                  <Award className="text-accent" size={32} />
                  <h2 className="font-serif text-4xl font-bold">
                    Awards & Recognition
                  </h2>
                </div>

                <div className="space-y-6">
                  {awards.map((award, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-6 pb-6 border-b border-border last:border-0"
                    >
                      <span className="text-sm font-medium text-accent min-w-[60px]">
                        {award.year}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">
                          {award.title}
                        </h3>
                        <p className="text-muted-foreground">{award.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
