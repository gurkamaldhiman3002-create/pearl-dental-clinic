type RatingStarsProps = {
  className?: string;
  rating: number;
};

export default function RatingStars({
  className = "",
  rating,
}: RatingStarsProps) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <span
      aria-label={`${safeRating} out of 5 stars`}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          aria-hidden="true"
          className={
            index < safeRating ? "text-[#c59a4a]" : "text-[#ded2bd]"
          }
          key={index}
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}
