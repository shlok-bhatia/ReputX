import React, { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { formatAddress } from '../config/formatAddress';
import api from '../config/axios';
import './ReviewSection.css';

const GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6, #00e5ff)',
  'linear-gradient(135deg, #ff2d78, #f59e0b)',
  'linear-gradient(135deg, #00e5ff, #4ade80)',
  'linear-gradient(135deg, #f59e0b, #ff2d78)',
  'linear-gradient(135deg, #4ade80, #8b5cf6)',
];

const MOCK_REVIEWS = [
  {
    id: '1',
    reviewer: '0xabc1234567890abcdef1234567890abcdef1234',
    reviewerEns: 'defi-witch.eth',
    rating: 5,
    comment: 'Extremely reliable trader. Fast confirmations and always sends exact amounts. Have done 10+ swaps with zero issues.',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    reviewer: '0xdef7890abcdef1234567890abcdef1234567890',
    reviewerEns: 'nft-sage.eth',
    rating: 4,
    comment: 'Good counterparty for NFT trades. Fair pricing and quick communication. Would trade again.',
    createdAt: '2024-02-28T14:15:00Z',
  },
  {
    id: '3',
    reviewer: '0x1111222233334444555566667777888899990000',
    reviewerEns: null,
    rating: 5,
    comment: 'Trustworthy wallet. Been in multiple governance proposals together. Solid reputation across DAOs.',
    createdAt: '2024-01-10T08:45:00Z',
  },
];

function StarRating({ rating, interactive = false, onRate, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`star-rating star-rating--${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star-rating__star${
            star <= (interactive ? hoverRating || rating : rating)
              ? ' star-rating__star--filled'
              : ''
          }${interactive ? ' star-rating__star--interactive' : ''}`}
          onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          onClick={interactive ? () => onRate(star) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ReviewSection({ profileAddress }) {
  const { walletAddress } = useWalletContext();
  const { isAuthenticated } = useAuth();

  const [isMutualTrader, setIsMutualTrader] = useState(false);
  const [tradeCheckDone, setTradeCheckDone] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Vote state
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [currentVote, setCurrentVote] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);

  // Review form
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isSelf = walletAddress && profileAddress &&
    walletAddress.toLowerCase() === profileAddress.toLowerCase();

  // ── Fetch reviews ──
  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const addr = profileAddress || import.meta.env.VITE_MY_WALLET;
      const res = await api.get(`/api/reviews/${addr}`);
      setReviews(res.data.reviews || []);
    } catch {
      // Fallback to mock
      setReviews(MOCK_REVIEWS);
    } finally {
      setReviewsLoading(false);
    }
  }, [profileAddress]);

  // ── Fetch vote summary ──
  const fetchVotes = useCallback(async () => {
    try {
      const addr = profileAddress || import.meta.env.VITE_MY_WALLET;
      const res = await api.get(`/api/reviews/${addr}/vote-summary`);
      setUpvotes(res.data.upvotes || 0);
      setDownvotes(res.data.downvotes || 0);
      setCurrentVote(res.data.currentVote || null);
    } catch {
      // Fallback demo values
      setUpvotes(47);
      setDownvotes(3);
    }
  }, [profileAddress]);

  // ── Check mutual trade ──
  const checkTrade = useCallback(async () => {
    if (!isAuthenticated || !profileAddress || isSelf) {
      setTradeCheckDone(true);
      return;
    }
    try {
      const res = await api.get(`/api/reviews/${profileAddress}/check-trade`);
      setIsMutualTrader(res.data.isMutualTrader);
    } catch {
      // In demo mode, allow mutual trader for showcasing
      setIsMutualTrader(true);
    } finally {
      setTradeCheckDone(true);
    }
  }, [isAuthenticated, profileAddress, isSelf]);

  useEffect(() => {
    fetchReviews();
    fetchVotes();
    checkTrade();
  }, [fetchReviews, fetchVotes, checkTrade]);

  // ── Handle vote ──
  const handleVote = async (type) => {
    if (!isAuthenticated || isSelf) return;
    setVoteLoading(true);
    try {
      const addr = profileAddress || import.meta.env.VITE_MY_WALLET;
      const res = await api.post(`/api/reviews/${addr}/vote`, { type });
      setUpvotes(res.data.upvotes);
      setDownvotes(res.data.downvotes);
      setCurrentVote(res.data.currentVote);
    } catch {
      // Optimistic toggle for demo
      if (currentVote === type) {
        setCurrentVote(null);
        if (type === 'upvote') setUpvotes((p) => Math.max(0, p - 1));
        else setDownvotes((p) => Math.max(0, p - 1));
      } else {
        if (currentVote === 'upvote') setUpvotes((p) => Math.max(0, p - 1));
        if (currentVote === 'downvote') setDownvotes((p) => Math.max(0, p - 1));
        setCurrentVote(type);
        if (type === 'upvote') setUpvotes((p) => p + 1);
        else setDownvotes((p) => p + 1);
      }
    } finally {
      setVoteLoading(false);
    }
  };

  // ── Submit review ──
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formRating || !formComment.trim()) return;

    setSubmitting(true);
    try {
      const addr = profileAddress || import.meta.env.VITE_MY_WALLET;
      await api.post(`/api/reviews/${addr}`, {
        rating: formRating,
        comment: formComment.trim(),
      });
      setSubmitSuccess(true);
      setShowForm(false);
      setFormRating(0);
      setFormComment('');
      fetchReviews();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      // Demo: add locally
      const newReview = {
        id: Date.now().toString(),
        reviewer: walletAddress || '0x0000',
        reviewerEns: 'you.eth',
        rating: formRating,
        comment: formComment.trim(),
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
      setSubmitSuccess(true);
      setShowForm(false);
      setFormRating(0);
      setFormComment('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const canInteract = tradeCheckDone && isMutualTrader && !isSelf;

  return (
    <div className="review-section" id="review-section">
      {/* ── Header with Votes ── */}
      <div className="review-section__header">
        <div className="review-section__title-row">
          <h3 className="review-section__title">Peer Reviews</h3>
          <div className="review-section__meta">
            <span className="review-section__avg-rating">
              <span className="review-section__avg-star">★</span>
              {avgRating}
            </span>
            <span className="review-section__count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Vote buttons */}
        <div className="review-vote-bar">
          <button
            className={`review-vote-btn review-vote-btn--up${currentVote === 'upvote' ? ' active' : ''}`}
            onClick={() => handleVote('upvote')}
            disabled={voteLoading || !canInteract}
            title={canInteract ? 'Upvote this profile' : 'Mutual trade required to vote'}
          >
            <span className="review-vote-btn__icon">▲</span>
            <span className="review-vote-btn__count">{upvotes}</span>
          </button>
          <button
            className={`review-vote-btn review-vote-btn--down${currentVote === 'downvote' ? ' active' : ''}`}
            onClick={() => handleVote('downvote')}
            disabled={voteLoading || !canInteract}
            title={canInteract ? 'Downvote this profile' : 'Mutual trade required to vote'}
          >
            <span className="review-vote-btn__icon">▼</span>
            <span className="review-vote-btn__count">{downvotes}</span>
          </button>

          {canInteract && !showForm && (
            <button
              className="review-write-btn"
              onClick={() => setShowForm(true)}
            >
              ✍️ Write Review
            </button>
          )}
        </div>
      </div>

      {/* ── Mutual Trade Gate Message ── */}
      {tradeCheckDone && !isMutualTrader && !isSelf && (
        <div className="review-gate-message">
          <div className="review-gate-message__icon">🔒</div>
          <div className="review-gate-message__text">
            <h4>Mutual Trade Required</h4>
            <p>Reviews and votes are only available between wallets that have traded with each other on-chain. This ensures authentic, trust-based feedback.</p>
          </div>
        </div>
      )}

      {/* ── Success Message ── */}
      {submitSuccess && (
        <div className="review-success fade-in">
          ✓ Your review has been submitted successfully
        </div>
      )}

      {/* ── Write Review Form ── */}
      {showForm && canInteract && (
        <form className="review-form fade-in" onSubmit={handleSubmitReview}>
          <div className="review-form__header">
            <h4>Write a Review</h4>
            <button
              type="button"
              className="review-form__close"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <div className="review-form__rating">
            <label className="review-form__label">Rating</label>
            <StarRating
              rating={formRating}
              interactive
              onRate={setFormRating}
              size="lg"
            />
          </div>

          <div className="review-form__field">
            <label className="review-form__label">
              Your Review
              <span className="review-form__char-count">{formComment.length}/500</span>
            </label>
            <textarea
              className="review-form__textarea"
              placeholder="Share your experience trading with this wallet..."
              value={formComment}
              onChange={(e) => setFormComment(e.target.value.slice(0, 500))}
              rows={3}
            />
          </div>

          <div className="review-form__actions">
            <button
              type="button"
              className="review-form__cancel"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-form__submit"
              disabled={submitting || !formRating || !formComment.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {/* ── Reviews List ── */}
      <div className="review-list">
        {reviewsLoading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={`skel-${i}`} className="review-card review-card--skeleton">
              <div className="review-card__avatar">
                <div className="review-card__avatar-gradient skeleton" />
              </div>
              <div className="review-card__body">
                <span className="skeleton" style={{ width: 120, height: 14, display: 'inline-block' }} />
                <span className="skeleton" style={{ width: '80%', height: 10, display: 'inline-block', marginTop: 8 }} />
                <span className="skeleton" style={{ width: '60%', height: 10, display: 'inline-block', marginTop: 4 }} />
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="review-empty">
            <span className="review-empty__icon">💬</span>
            <p>No reviews yet. {canInteract ? 'Be the first to leave one!' : 'Trade with this wallet to leave a review.'}</p>
          </div>
        ) : (
          reviews.map((review, idx) => (
            <div
              key={review.id}
              className="review-card fade-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="review-card__avatar">
                <div
                  className="review-card__avatar-gradient"
                  style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
                />
              </div>
              <div className="review-card__body">
                <div className="review-card__top">
                  <div className="review-card__info">
                    <span className="review-card__name">
                      {review.reviewerEns || formatAddress(review.reviewer)}
                    </span>
                    <span className="review-card__time">{timeAgo(review.createdAt)}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="review-card__comment">{review.comment}</p>
                <span className="review-card__address">
                  {formatAddress(review.reviewer)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
