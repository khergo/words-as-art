import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditableText } from "@/components/EditableText";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { data: pageContent } = useQuery({
    queryKey: ['page-content', 'contact'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_name', 'contact');
      if (error) throw error;
      return data;
    },
  });

  const getContent = (sectionKey: string) => {
    return pageContent?.find(item => item.section_key === sectionKey)?.content_value || '';
  };

  const updateContent = async (sectionKey: string, value: string) => {
    const content = pageContent?.find(item => item.section_key === sectionKey);
    if (!content) return;

    const { error } = await supabase
      .from('page_content')
      .update({ content_value: value })
      .eq('id', content.id);
    
    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);
      
      // Send email via edge function
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: validatedData,
      });
      
      if (error) throw error;
      
      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen relative">
      <Navigation />

      <main className="pt-24 relative z-10">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <EditableText
                value={getContent('title')}
                onSave={(value) => updateContent('title', value)}
                as="h1"
                className="font-handwritten text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-[#1a1a1a] transform -rotate-1"
              />
              <EditableText
                value={getContent('subtitle')}
                onSave={(value) => updateContent('subtitle', value)}
                as="p"
                className="text-2xl font-handwritten text-[#333] animate-fade-in-delay transform rotate-1"
              />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto pl-6">
              <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-handwritten font-medium mb-2 text-[#1a1a1a] transform -rotate-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#f6f6f6] border-2 border-[#d4a574] focus:border-[#dc3545] focus:outline-none transition-colors font-handwritten text-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-handwritten font-medium mb-2 text-[#1a1a1a] transform rotate-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#f6f6f6] border-2 border-[#d4a574] focus:border-[#dc3545] focus:outline-none transition-colors font-handwritten text-lg"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-handwritten font-medium mb-2 text-[#1a1a1a] transform -rotate-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-[#f6f6f6] border-2 border-[#d4a574] focus:border-[#dc3545] focus:outline-none transition-colors resize-none font-handwritten text-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#dc3545] text-white font-handwritten text-xl font-medium hover:scale-[1.02] transition-transform transform -rotate-1 shadow-lg"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-16 text-center">
                <EditableText
                  value={getContent('direct_contact_text')}
                  onSave={(value) => updateContent('direct_contact_text', value)}
                  as="p"
                  className="text-lg font-handwritten text-[#666] mb-2 transform rotate-1"
                />
                <a
                  href={`mailto:${getContent('email')}`}
                  className="text-2xl font-handwritten font-medium text-[#dc3545] hover:underline transform -rotate-1 inline-block"
                >
                  <EditableText
                    value={getContent('email')}
                    onSave={(value) => updateContent('email', value)}
                    as="span"
                    className="text-2xl font-handwritten font-medium text-[#dc3545]"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
