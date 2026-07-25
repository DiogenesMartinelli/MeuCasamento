import Image from "next/image";

type HeroSectionProps = {
  coupleName: string;
  welcomeMessage: string;
  backgroundImageUrl?: string | null;
  profileImageUrl?: string | null;
};

export function HeroSection({
  coupleName,
  welcomeMessage,
  backgroundImageUrl,
  profileImageUrl,
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {backgroundImageUrl ? (
        <Image
          src={backgroundImageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950" />
      )}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center text-white">
        {profileImageUrl && (
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/80 shadow-lg sm:h-36 sm:w-36">
            <Image
              src={profileImageUrl}
              alt={coupleName}
              width={144}
              height={144}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
          {coupleName}
        </h1>
        {welcomeMessage && (
          <p className="text-balance text-lg text-white/90 sm:text-xl">{welcomeMessage}</p>
        )}
      </div>
    </section>
  );
}
