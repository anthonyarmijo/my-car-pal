"use client";

interface HeroVideoProps {
  /** Video source URL. Falls back to poster image if not provided. */
  src?: string;
  /** Poster image shown before video plays or as fallback */
  poster?: string;
  /** Heading text overlaid on the video */
  heading?: string;
  /** Subtext below heading */
  subtext?: string;
  /** CTA link href */
  ctaHref?: string;
  /** CTA button text */
  ctaText?: string;
}

export default function HeroVideo({
  src,
  poster = "/images/landing/hero-placeholder.svg",
  heading,
  subtext,
  ctaHref,
  ctaText,
}: HeroVideoProps) {
  return (
    <div className="landing-hero-video" aria-label="Hero video banner">
      {src ? (
        <video
          className="landing-hero-video-element"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div
          className="landing-hero-video-poster"
          role="img"
          aria-label="Car driving on a scenic highway"
          style={
            poster
              ? { backgroundImage: `url(${poster})` }
              : undefined
          }
        />
      )}
      {/* Dark overlay */}
      <div className="landing-hero-video-overlay" aria-hidden="true" />

      {/* Overlay content */}
      {(heading || subtext || (ctaHref && ctaText)) && (
        <div className="landing-hero-video-content">
          {heading && <h2 className="landing-hero-video-heading">{heading}</h2>}
          {subtext && <p className="landing-hero-video-subtext">{subtext}</p>}
          {ctaHref && ctaText && (
            <a href={ctaHref} className="button-primary landing-hero-video-cta">
              {ctaText}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
