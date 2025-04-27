import { useState } from "react";
import PropType from "prop-types";
import "./StarRating.css";

StarRating.propTypes = {
  children: PropType.node,
  maxStars: PropType.number.isRequired,
  value: PropType.number,
  onChange: PropType.func,
  defaultRating: PropType.number,
};

export default function StarRating({
  children,
  maxStars = 10,
  value: externalValue,
  onChange,
  defaultRating = 0,
}) {
  const [value, setValue] = useState(defaultRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Determine the current rating based on whether an external value is provided
  const currentRating = onChange ? externalValue : value;

  function handleRating(rating) {
    setValue(rating);
    if (onChange) onChange(rating);
  }

  function handleMouseEnter(rating) {
    setHoveredRating(rating);
  }

  function handleMouseLeave() {
    setHoveredRating(0);
  }

  // Generate an array of stars based on the maxStars prop
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <Star
          key={star}
          star={star}
          selected={currentRating >= star}
          hovered={hoveredRating >= star}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onChange={handleRating}
        />
      ))}
      {/* Display the current rating or custom children */}
      <span className="rating-value">{children || currentRating || ""}</span>
    </div>
  );
}

function Star({
  star,
  selected = false,
  hovered = false,
  onMouseEnter,
  onMouseLeave,
  onChange,
}) {
  return (
    <span
      className={`star ${selected ? "selected" : ""} ${hovered ? "hover" : ""}`}
      onClick={() => onChange(star)}
      onMouseEnter={() => onMouseEnter(star)}
      onMouseLeave={onMouseLeave}
    >
      {selected ? "★" : "☆"}
    </span>
  );
}
