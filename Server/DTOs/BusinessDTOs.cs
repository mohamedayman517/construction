using System.ComponentModel.DataAnnotations;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.DTOs
{
    // Product DTOs
    public class ProductDto
    {
        public int Id { get; set; }
        public string NameEn { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionAr { get; set; }
        public string MerchantId { get; set; } = string.Empty;
        public string MerchantName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string Currency { get; set; } = "USD";
        public int StockQuantity { get; set; }
        public bool AllowCustomDimensions { get; set; }
        public bool IsAvailableForRent { get; set; }
        public decimal? RentPricePerDay { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public decimal? AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public List<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
        public List<ProductAttributeDto> Attributes { get; set; } = new List<ProductAttributeDto>();
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDto
    {
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
        public int CategoryId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? DiscountPrice { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public bool AllowCustomDimensions { get; set; }
        public bool IsAvailableForRent { get; set; }
        public decimal? RentPricePerDay { get; set; }

        public List<CreateProductAttributeDto> Attributes { get; set; } = new List<CreateProductAttributeDto>();
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ProductAttributeDto
    {
        public int Id { get; set; }
        public string NameEn { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string ValueEn { get; set; } = string.Empty;
        public string ValueAr { get; set; } = string.Empty;
    }

    public class CreateProductAttributeDto
    {
        [Required]
        public string NameEn { get; set; } = string.Empty;
        [Required]
        public string NameAr { get; set; } = string.Empty;
        [Required]
        public string ValueEn { get; set; } = string.Empty;
        [Required]
        public string ValueAr { get; set; } = string.Empty;
    }

    // Project DTOs
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime? RequiredByDate { get; set; }
        public string? Location { get; set; }
        public ProjectStatus Status { get; set; }
        public DateTime BiddingDeadline { get; set; }
        public int ViewCount { get; set; }
        public int BidCount { get; set; }
        public List<ProjectImageDto> Images { get; set; } = new List<ProjectImageDto>();
        public List<BidDto> Bids { get; set; } = new List<BidDto>();
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProjectDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public DateTime? RequiredByDate { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [Required]
        public DateTime BiddingDeadline { get; set; }

        [MaxLength(1000)]
        public string? SpecialRequirements { get; set; }
    }

    public class ProjectImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    // Bid DTOs
    public class BidDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string MerchantId { get; set; } = string.Empty;
        public string MerchantName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public int EstimatedDays { get; set; }
        public string Proposal { get; set; } = string.Empty;
        public BidStatus Status { get; set; }
        public DateTime ValidUntil { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBidDto
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int EstimatedDays { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Proposal { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? MaterialsDescription { get; set; }

        [Required]
        public DateTime ValidUntil { get; set; }
    }

    // Service Request DTOs
    public class ServiceRequestDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MerchantId { get; set; } = string.Empty;
        public string MerchantName { get; set; } = string.Empty;
        public ServiceType ServiceType { get; set; }
        public decimal PayRate { get; set; }
        public string Currency { get; set; } = "USD";
        public string Location { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int WorkersNeeded { get; set; }
        public ServiceRequestStatus Status { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime ApplicationDeadline { get; set; }
        public int ViewCount { get; set; }
        public int ApplicationCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateServiceRequestDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public ServiceType ServiceType { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal PayRate { get; set; }

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int WorkersNeeded { get; set; }

        [Required]
        public DateTime ApplicationDeadline { get; set; }

        [MaxLength(500)]
        public string? RequiredSkills { get; set; }
    }

    // Rental DTOs
    public class RentalDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string MerchantId { get; set; } = string.Empty;
        public string MerchantName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int RentalDays { get; set; }
        public decimal DailyRate { get; set; }
        public decimal TotalAmount { get; set; }
        public RentalStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateRentalDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }

        public bool RequiresDelivery { get; set; }

        [MaxLength(1000)]
        public string? SpecialInstructions { get; set; }
    }

    // Category DTOs
    public class CategoryDto
    {
        public int Id { get; set; }
        public string NameEn { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionAr { get; set; }
        public string? ImageUrl { get; set; }
        public int? ParentCategoryId { get; set; }
        public List<CategoryDto> SubCategories { get; set; } = new List<CategoryDto>();
        public int ProductCount { get; set; }
    }

    // Common DTOs
    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }

    public class SearchFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Location { get; set; }
        public bool? IsAvailableForRent { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "CreatedAt";
        public bool SortDescending { get; set; } = true;
    }
}

