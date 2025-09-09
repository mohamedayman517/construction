using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public enum ServiceType
    {
        Daily = 0,
        Hourly = 1,
        Project = 2
    }

    public enum ServiceRequestStatus
    {
        Open = 0,
        InProgress = 1,
        Completed = 2,
        Cancelled = 3
    }

    public class ServiceRequest
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        public ServiceType ServiceType { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PayRate { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [MaxLength(100)]
        public string? WorkingHours { get; set; }

        [Required]
        public int WorkersNeeded { get; set; } = 1;

        [MaxLength(500)]
        public string? RequiredSkills { get; set; }

        [MaxLength(500)]
        public string? RequiredExperience { get; set; }

        [MaxLength(500)]
        public string? RequiredTools { get; set; }

        public bool ToolsProvided { get; set; } = false;

        public bool TransportationProvided { get; set; } = false;

        public bool MealsProvided { get; set; } = false;

        public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Open;

        // Admin approval
        public bool IsApproved { get; set; } = false;

        public DateTime? ApprovedAt { get; set; }

        public DateTime ApplicationDeadline { get; set; }

        public int ViewCount { get; set; } = 0;

        public int ApplicationCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual ICollection<ServiceApplication> Applications { get; set; } = new List<ServiceApplication>();
    }

    public enum ApplicationStatus
    {
        Submitted = 0,
        UnderReview = 1,
        Accepted = 2,
        Rejected = 3,
        Withdrawn = 4
    }

    public class ServiceApplication
    {
        public int Id { get; set; }

        [Required]
        public int ServiceRequestId { get; set; }

        [Required]
        public string WorkerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string CoverLetter { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ProposedRate { get; set; }

        [MaxLength(500)]
        public string? Experience { get; set; }

        [MaxLength(500)]
        public string? Skills { get; set; }

        [MaxLength(500)]
        public string? Portfolio { get; set; }

        [MaxLength(500)]
        public string? References { get; set; }

        public bool HasOwnTools { get; set; } = false;

        public bool HasTransportation { get; set; } = false;

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        public DateTime? InterviewDate { get; set; }

        [MaxLength(500)]
        public string? InterviewNotes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ServiceRequest ServiceRequest { get; set; } = null!;
        public virtual ApplicationUser Worker { get; set; } = null!;
    }
}

