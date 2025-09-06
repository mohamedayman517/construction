using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public enum RentalStatus
    {
        Pending = 0,
        Confirmed = 1,
        InUse = 2,
        Returned = 3,
        Cancelled = 4,
        Overdue = 5
    }

    public class Rental
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int RentalDays { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailyRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SecurityDeposit { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }

        public bool RequiresDelivery { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DeliveryFee { get; set; }

        public bool RequiresPickup { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PickupFee { get; set; }

        [MaxLength(1000)]
        public string? SpecialInstructions { get; set; }

        [MaxLength(1000)]
        public string? UsageNotes { get; set; }

        public RentalStatus Status { get; set; } = RentalStatus.Pending;

        public DateTime? ConfirmedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        public DateTime? ReturnedAt { get; set; }

        [MaxLength(1000)]
        public string? ReturnConditionNotes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DamageCharges { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? LateFees { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RefundAmount { get; set; }

        public bool IsInsured { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? InsuranceFee { get; set; }

        [MaxLength(100)]
        public string? InsuranceProvider { get; set; }

        [MaxLength(100)]
        public string? InsurancePolicyNumber { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
        public virtual ApplicationUser Customer { get; set; } = null!;
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual ICollection<RentalImage> Images { get; set; } = new List<RentalImage>();
        public virtual ICollection<RentalPayment> Payments { get; set; } = new List<RentalPayment>();
    }

    public class RentalImage
    {
        public int Id { get; set; }

        [Required]
        public int RentalId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string ImageType { get; set; } = string.Empty; // "before_rental", "after_return", "damage"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Rental Rental { get; set; } = null!;
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = 2,
        Refunded = 3
    }

    public class RentalPayment
    {
        public int Id { get; set; }

        [Required]
        public int RentalId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        [MaxLength(50)]
        public string PaymentType { get; set; } = string.Empty; // "rental", "deposit", "damage", "late_fee"

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? TransactionId { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime? PaidAt { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Rental Rental { get; set; } = null!;
    }
}

