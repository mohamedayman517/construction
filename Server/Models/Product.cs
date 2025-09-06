using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConstructionMarketplace.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string NameEn { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string NameAr { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? DescriptionEn { get; set; }

        [MaxLength(1000)]
        public string? DescriptionAr { get; set; }

        [Required]
        public string MerchantId { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; }

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; } = "USD";

        [Required]
        public int StockQuantity { get; set; }

        public int MinOrderQuantity { get; set; } = 1;

        [MaxLength(50)]
        public string? SKU { get; set; }

        [MaxLength(50)]
        public string? Barcode { get; set; }

        // Dimensions
        [Column(TypeName = "decimal(10,2)")]
        public decimal? Length { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Width { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Height { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Weight { get; set; }

        [MaxLength(20)]
        public string? DimensionUnit { get; set; } = "cm";

        [MaxLength(20)]
        public string? WeightUnit { get; set; } = "kg";

        // Custom dimensions support
        public bool AllowCustomDimensions { get; set; } = false;

        [MaxLength(500)]
        public string? CustomDimensionInstructions { get; set; }

        // Product status
        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public bool IsAvailableForRent { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RentPricePerDay { get; set; }

        // SEO and metadata
        [MaxLength(200)]
        public string? MetaTitleEn { get; set; }

        [MaxLength(200)]
        public string? MetaTitleAr { get; set; }

        [MaxLength(500)]
        public string? MetaDescriptionEn { get; set; }

        [MaxLength(500)]
        public string? MetaDescriptionAr { get; set; }

        [MaxLength(200)]
        public string? Slug { get; set; }

        // Statistics
        public int ViewCount { get; set; } = 0;

        public int OrderCount { get; set; } = 0;

        public decimal? AverageRating { get; set; }

        public int ReviewCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser Merchant { get; set; } = null!;
        public virtual Category Category { get; set; } = null!;
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public virtual ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Rental> Rentals { get; set; } = new List<Rental>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class ProductImage
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AltText { get; set; }

        public bool IsPrimary { get; set; } = false;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
    }

    public class ProductAttribute
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(100)]
        public string NameEn { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string NameAr { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ValueEn { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ValueAr { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        // Navigation properties
        public virtual Product Product { get; set; } = null!;
    }
}

