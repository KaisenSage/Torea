"use client";

export default function ExperienceVideoSection() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen max-w-none h-[60vh] md:h-[80vh] overflow-hidden mb-10">
      <video
        src="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/IMG_0354.MP4"
        autoPlay
        loop
        muted
        playsInline
        poster="https://pub-bd618a9723f54128a9dbd24698f83fba.r2.dev/torea-tops.webp"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
}
