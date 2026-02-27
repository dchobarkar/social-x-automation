import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-background text-foreground">
      <h1 className="text-2xl font-semibold tracking-tight">
        Social X Automation Bot
      </h1>
      <p className="text-(--foreground)/70 text-center max-w-md">
        Authenticate with X, generate AI replies with OpenAI, and post them via
        the X API.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] transition-colors font-medium"
      >
        Open Dashboard
      </Link>
    </div>
  );
};

export default Page;
