import { Sparkles } from "lucide-react";

import PlatformCard from "@/components/ui/PlatformCard";
import SectionLayout from "@/components/ui/SectionLayout";
import { HOME_PLATFORM_CARDS } from "@/constants/home";

const Page = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionLayout
        as="main"
        padding="lg"
        contentMaxWidth="max-w-6xl"
        className="flex min-h-screen flex-col justify-center"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-4xl border border-white/70 bg-white/75 p-8 shadow-(--shadow-soft) backdrop-blur-xl md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              AI-powered reply workflow
            </div>

            <h1 className="text-balance mt-6 text-h1 font-bold tracking-tight text-foreground">
              Move from post discovery to polished reply drafts without visual
              clutter.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
              Connect a platform, scan fresh posts, generate context-aware
              drafts, and only open the social app when you are ready to post.
              The interface is designed to keep the busywork out of the way.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Load high-signal posts"],
                ["2", "Generate and validate replies"],
                ["3", "Post manually with confidence"],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className="rounded-3xl border border-border/70 bg-surface p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">
                    Step {step}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {HOME_PLATFORM_CARDS.map(
              ({ title, description, href, cta, muted }) => (
                <PlatformCard
                  key={href}
                  title={title}
                  description={description}
                  href={href}
                  muted={muted}
                >
                  {cta}
                </PlatformCard>
              ),
            )}
          </div>
        </div>
      </SectionLayout>
    </div>
  );
};

export default Page;
