using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public enum ProjectStatus
    {
        Draft = 0,
        Published = 1,
        InBidding = 2,
        BidSelected = 3,
        InProgress = 4,
        Completed = 5,
        Cancelled = 6
    }

    public enum ProjectPriority
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Urgent = 3
    }

    public class Project
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        // Custom dimensions for the project
        [Column(TypeName = "decimal(10,2)")]
        public decimal? RequiredLength { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? RequiredWidth { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? RequiredHeight { get; set; }

        [MaxLength(20)]
        public string? DimensionUnit { get; set; } = "cm";

        [MaxLength(1000)]
        public string? SpecialRequirements { get; set; }

        [MaxLength(500)]
        public string? PreferredMaterials { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BudgetMin { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BudgetMax { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        public DateTime? RequiredByDate { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        public ProjectStatus Status { get; set; } = ProjectStatus.Draft;

        public ProjectPriority Priority { get; set; } = ProjectPriority.Medium;

        public DateTime BiddingDeadline { get; set; }

        public bool AllowCounterOffers { get; set; } = true;

        public int? SelectedBidId { get; set; }

        public DateTime? ProjectStartDate { get; set; }

        public DateTime? ProjectEndDate { get; set; }

        public int ViewCount { get; set; } = 0;

        public int BidCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Customer { get; set; } = null!;
        public virtual Category Category { get; set; } = null!;
        public virtual Bid? SelectedBid { get; set; }
        public virtual ICollection<Bid> Bids { get; set; } = new List<Bid>();
        public virtual ICollection<ProjectImage> Images { get; set; } = new List<ProjectImage>();
        public virtual ICollection<ProjectUpdate> Updates { get; set; } = new List<ProjectUpdate>();
    }

    public class ProjectImage
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Project Project { get; set; } = null!;
    }

    public class ProjectUpdate
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int ProgressPercentage { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Project Project { get; set; } = null!;
    }

    public enum BidStatus
    {
        Submitted = 0,
        UnderReview = 1,
        Accepted = 2,
        Rejected = 3,
        Withdrawn = 4
    }

    public class Bid
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public int EstimatedDays { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Proposal { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? MaterialsDescription { get; set; }

        [MaxLength(500)]
        public string? WorkersRequired { get; set; }

        public int QualityRating { get; set; } = 5; // 1-5 scale

        public BidStatus Status { get; set; } = BidStatus.Submitted;

        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        public bool IsCounterOffer { get; set; } = false;

        public int? OriginalBidId { get; set; }

        public DateTime ValidUntil { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Project Project { get; set; } = null!;
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual Bid? OriginalBid { get; set; }
        public virtual ICollection<Bid> CounterOffers { get; set; } = new List<Bid>();
    }
}

