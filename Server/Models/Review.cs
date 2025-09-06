using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public string ReviewerId { get; set; } = string.Empty;

        [Required]
        public string RevieweeId { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        public int? ProjectId { get; set; }

        public int? ServiceRequestId { get; set; }

        public int? RentalId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Response { get; set; }

        public DateTime? ResponseDate { get; set; }

        public bool IsVerified { get; set; } = false;

        public bool IsPublic { get; set; } = true;

        public int HelpfulCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Reviewer { get; set; } = null!;
        public virtual ApplicationUser Reviewee { get; set; } = null!;
        public virtual Product? Product { get; set; }
        public virtual Project? Project { get; set; }
        public virtual ServiceRequest? ServiceRequest { get; set; }
        public virtual Rental? Rental { get; set; }
    }

    public enum OrderStatus
    {
        Pending = 0,
        Confirmed = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Completed = 5,
        Cancelled = 6,
        Refunded = 7
    }

    public class Order
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        [MaxLength(200)]
        public string ShippingName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ShippingCity { get; set; }

        [MaxLength(50)]
        public string? ShippingState { get; set; }

        [MaxLength(20)]
        public string? ShippingPostalCode { get; set; }

        [MaxLength(50)]
        public string? ShippingCountry { get; set; }

        [MaxLength(20)]
        public string? ShippingPhone { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? PaymentReference { get; set; }

        public DateTime? PaymentDate { get; set; }

        public DateTime? ShippedDate { get; set; }

        public DateTime? DeliveredDate { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        [MaxLength(100)]
        public string? ShippingCarrier { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Customer { get; set; } = null!;
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        // Custom dimensions if applicable
        [Column(TypeName = "decimal(10,2)")]
        public decimal? CustomLength { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? CustomWidth { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? CustomHeight { get; set; }

        [MaxLength(500)]
        public string? CustomSpecifications { get; set; }

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}

