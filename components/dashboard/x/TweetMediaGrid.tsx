import Image from "next/image";

import type { TweetMedia } from "@/types/x/tweet";
import { cn } from "@/utils/cn";

export type TweetMediaGridProps = {
  media: TweetMedia[];
};

const getMediaAspectRatio = (media: TweetMedia): string => {
  if (media.width != null && media.height != null && media.height > 0)
    return `${media.width} / ${media.height}`;

  if (media.type === "video") return "16 / 9";
  if (media.type === "animated_gif") return "1 / 1";
  return "1 / 1";
};

const getFixedImageSize = (
  media: TweetMedia,
  aspectRatio?: string | null,
): { width: number; height: number } => {
  if (media.width != null && media.height != null && media.height > 0) {
    // Cap to keep image optimization reasonable while preserving ratio.
    const maxW = 1200;
    const scale = Math.min(1, maxW / media.width);
    return {
      width: Math.round(media.width * scale),
      height: Math.round(media.height * scale),
    };
  }

  const ar = aspectRatio ?? getMediaAspectRatio(media);
  if (ar === "16 / 9") return { width: 1200, height: 675 };
  // Default square tiles (matches X multi-image grid feel).
  return { width: 900, height: 900 };
};

const MediaTile = ({
  media,
  className,
  fit = "cover",
  aspectRatio,
}: {
  media: TweetMedia;
  className?: string;
  fit?: "cover" | "contain";
  aspectRatio?: string | null;
}) => {
  const src =
    media.type === "photo" && media.url
      ? media.url
      : (media.preview_image_url ?? media.url);
  const isVideo = media.type === "video" || media.type === "animated_gif";
  const shouldAutoPlay = media.type === "animated_gif";

  if (!src) return null;

  const fixedSize = getFixedImageSize(media, aspectRatio);

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={
        aspectRatio === null
          ? undefined
          : { aspectRatio: aspectRatio ?? getMediaAspectRatio(media) }
      }
    >
      {isVideo ? (
        <video
          className={cn(
            "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
          src={media.url ?? src}
          poster={media.preview_image_url ?? undefined}
          controls={media.type === "video"}
          autoPlay={shouldAutoPlay}
          loop={shouldAutoPlay}
          muted={shouldAutoPlay}
          playsInline
          preload="metadata"
        />
      ) : (
        <Image
          src={src}
          alt=""
          width={fixedSize.width}
          height={fixedSize.height}
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

  if (media.length === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/60">
        <MediaTile media={media[0]} fit="cover" />
      </div>
    );
  }

  if (media.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted">
        {media.map((item) => (
          <MediaTile
            key={item.url ?? item.preview_image_url}
            media={item}
            aspectRatio="1 / 1"
          />
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="mt-3 grid h-105 gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted sm:h-120">
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5">
          <MediaTile
            media={media[0]}
            className="row-span-2 h-full"
            fit="cover"
            aspectRatio={null}
          />

          <MediaTile
            media={media[1]}
            className="h-full"
            fit="cover"
            aspectRatio="1 / 1"
          />

          <MediaTile
            media={media[2]}
            className="h-full"
            fit="cover"
            aspectRatio="1 / 1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-0.5 overflow-hidden rounded-2xl border border-border/60 bg-muted">
      {media.slice(0, 4).map((item) => (
        <MediaTile
          key={item.url ?? item.preview_image_url}
          media={item}
          aspectRatio="1 / 1"
        />
      ))}
    </div>
  );
};

export default TweetMediaGrid;
