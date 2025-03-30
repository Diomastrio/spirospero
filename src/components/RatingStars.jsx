import React, { useState } from "react";
import { Star } from "lucide-react";
import { useUserRating, useAddRating } from "../services/ratingHooks";
import { useUser } from "../authentication/authHooks";
import { useNavigate } from "react-router-dom";

const RatingStars = ({ novelId }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [hoveredRating, setHoveredRating] = useState(0);
  const { data: userRating } = useUserRating(novelId);
  const { addRating, isLoading } = useAddRating();

  const handleRatingClick = (rating) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addRating({ novel_id: novelId, rating });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={isLoading}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 -ml-1 first:ml-0 focus:outline-none disabled:opacity-50"
          >
            <Star
              size={20}
              className={`transition-colors ${
                star <= (hoveredRating || userRating || 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        ))}
        {userRating ? (
          <span className="ml-2 text-sm">Your rating: {userRating}</span>
        ) : (
          <span className="ml-2 text-sm opacity-75">Rate this novel</span>
        )}
      </div>
      {!user && <p className="text-xs opacity-70">Login to rate this novel</p>}
    </div>
  );
};

export default RatingStars;
