import Image from "next/image";

import type { TweetMedia } from "@/types/x/tweet";
import { cn } from "@/utils/cn";

export type TweetMediaGridProps = {
  media: TweetMedia[];
};

const MediaTile = ({
  media,
  className,
  fit = "cover",
}: {
  media: TweetMedia;
  className?: string;
  fit?: "cover" | "contain";
}) => {
  const playableVideoUrl =
    media.variants
      ?.filter((variant) => variant.content_type === "video/mp4")
      .sort((a, b) => (b.bit_rate ?? 0) - (a.bit_rate ?? 0))[0]?.url ??
    media.url;
  const src =
    media.type === "photo" && media.url
      ? media.url
      : (media.preview_image_url ?? media.url);
  const isVideo = media.type === "video" || media.type === "animated_gif";
  const shouldAutoPlay = media.type === "animated_gif";

  if (!src) return null;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-muted",
        className,
      )}
    >
      {isVideo && playableVideoUrl ? (
        <video
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
          src={playableVideoUrl}
          poster={media.preview_image_url ?? undefined}
          controls={media.type === "video"}
          autoPlay={shouldAutoPlay}
          loop={shouldAutoPlay}
          muted={shouldAutoPlay}
          playsInline
          preload="metadata"
        />
      ) : isVideo ? (
        <>
          <Image
            src={src}
            alt=""
            fill
            className={cn(
              "h-full w-full",
              fit === "cover" ? "object-cover" : "object-contain",
            )}
            sizes="(max-width: 640px) 100vw, 50vw"
          />

          <div className="absolute inset-x-3 bottom-3 rounded-full bg-black/65 px-3 py-1.5 text-center text-xs text-white">
            Open on X to play this video
          </div>
        </>
      ) : (
        <Image
          src={src}
          alt=""
          fill
          className={cn(
            "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      )}
    </div>
  );
};

const TweetMediaGrid = ({ media }: TweetMediaGridProps) => {
  if (media.length === 0) return null;

  // Fixed heights so the media grid doesn't balloon with varying aspect ratios.
  const singleHeight = "h-72 sm:h-80"; // ~288px -> 320px
  const twoHeight = "h-56 sm:h-64"; // ~224px -> 256px
  const threeHeight = "h-64 sm:h-72"; // ~256px -> 288px
  const fourHeight = "h-56 sm:h-64"; // ~224px -> 256px

  if (media.length === 1) {
    return (
      <div
        className={cn(
          "mt-3 overflow-hidden rounded-2xl border border-border/60",
          singleHeight,
        )}
      >
        <MediaTile media={media[0]} fit="cover" className="h-full" />
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div
        className={cn(
          "mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted",
          twoHeight,
        )}
      >
        {media.map((item) => (
          <MediaTile
            key={item.media_key ?? item.url ?? item.preview_image_url}
            media={item}
            className="h-full"
          />
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div
        className={cn(
          "mt-3 grid gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted",
          threeHeight,
        )}
      >
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
          <MediaTile
            media={media[0]}
            className="row-span-2 col-span-1 h-full"
            fit="cover"
          />

          <MediaTile media={media[1]} className="h-full" fit="cover" />

          <MediaTile media={media[2]} className="h-full" fit="cover" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted",
        fourHeight,
      )}
    >
      {media.slice(0, 4).map((item) => (
        <MediaTile
          key={item.media_key ?? item.url ?? item.preview_image_url}
          media={item}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default TweetMediaGrid;
