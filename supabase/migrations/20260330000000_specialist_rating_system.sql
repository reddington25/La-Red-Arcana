-- Add fields for manual ratings and excellence badge
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS excellence_badge BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS manual_rating NUMERIC DEFAULT NULL;

-- Create policy for admins/super_admins to update these fields (if not already covered by existing policies)
-- The application normally allows admins to update specialists via the admin dashboard.

-- Update the rating function to use a Bayesian average anchored to 4.5 stars
-- The "fake" count is 3, to make the initial scores closer to 4.5
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS trigger AS $$
DECLARE
  v_fake_reviews_count CONSTANT NUMERIC := 3.0; 
  v_fake_rating_average CONSTANT NUMERIC := 4.5;
  v_total_real_reviews INTEGER;
  v_sum_real_ratings NUMERIC;
BEGIN
  -- Get total reviews and sum of their ratings for the specialist
  SELECT COUNT(*), COALESCE(SUM(rating), 0)
  INTO v_total_real_reviews, v_sum_real_ratings
  FROM public.reviews
  WHERE reviewee_id = NEW.reviewee_id;

  -- The formula: (Sum of real ratings + weight * anchor) / (Number of real reviews + weight)
  UPDATE public.users
  SET 
    average_rating = ROUND(
      (v_sum_real_ratings + (v_fake_reviews_count * v_fake_rating_average)) / 
      (v_total_real_reviews + v_fake_reviews_count)
    , 1),
    total_reviews = v_total_real_reviews
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger an update across existing users to apply the Bayesian average immediately
-- Instead of iterating, we use an update using a subquery
UPDATE public.users u
SET
  total_reviews = COALESCE(r.rcount, 0),
  average_rating = ROUND(
    (COALESCE(r.rsum, 0) + (3.0 * 4.5)) / (COALESCE(r.rcount, 0) + 3.0)
  , 1)
FROM (
  SELECT reviewee_id, COUNT(*) as rcount, SUM(rating) as rsum
  FROM public.reviews
  GROUP BY reviewee_id
) r
WHERE u.id = r.reviewee_id;
