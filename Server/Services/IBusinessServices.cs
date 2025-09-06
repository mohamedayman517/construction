using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;
using System.ComponentModel.DataAnnotations;

namespace ConstructionMarketplace.Services
{
    public interface IProductService
    {
        Task<PagedResultDto<ProductDto>> GetProductsAsync(SearchFilterDto filter);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductBySlugAsync(string slug);
        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<ProductDto>> GetProductsByMerchantAsync(string merchantId);
        Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync();
        Task<IEnumerable<ProductDto>> GetAvailableForRentAsync();
        Task<ProductDto> CreateProductAsync(string merchantId, CreateProductDto createProductDto);
        Task<ProductDto?> UpdateProductAsync(int id, string merchantId, CreateProductDto updateProductDto);
        Task<bool> DeleteProductAsync(int id, string merchantId);
        Task<bool> UpdateStockAsync(int id, int newStock);
        Task<bool> IncrementViewCountAsync(int id);
    }

    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetRootCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetSubCategoriesAsync(int parentCategoryId);
        Task<CategoryDto?> GetCategoryByIdAsync(int id);
        Task<CategoryDto?> GetCategoryWithSubCategoriesAsync(int id);
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    }

    public interface IProjectService
    {
        Task<PagedResultDto<ProjectDto>> GetProjectsAsync(SearchFilterDto filter);
        Task<ProjectDto?> GetProjectByIdAsync(int id);
        Task<IEnumerable<ProjectDto>> GetProjectsByCustomerAsync(string customerId);
        Task<IEnumerable<ProjectDto>> GetOpenProjectsAsync();
        Task<ProjectDto> CreateProjectAsync(string customerId, CreateProjectDto createProjectDto);
        Task<ProjectDto?> UpdateProjectAsync(int id, string customerId, CreateProjectDto updateProjectDto);
        Task<bool> DeleteProjectAsync(int id, string customerId);
        Task<bool> SelectBidAsync(int projectId, int bidId, string customerId);
        Task<bool> IncrementViewCountAsync(int id);
    }

    public interface IBidService
    {
        Task<IEnumerable<BidDto>> GetBidsByProjectAsync(int projectId);
        Task<IEnumerable<BidDto>> GetBidsByMerchantAsync(string merchantId);
        Task<BidDto?> GetBidByIdAsync(int id);
        Task<BidDto> CreateBidAsync(string merchantId, CreateBidDto createBidDto);
        Task<BidDto?> UpdateBidAsync(int id, string merchantId, CreateBidDto updateBidDto);
        Task<bool> WithdrawBidAsync(int id, string merchantId);
        Task<bool> AcceptBidAsync(int id, string customerId);
        Task<bool> RejectBidAsync(int id, string customerId, string reason);
    }

    public interface IServiceRequestService
    {
        Task<PagedResultDto<ServiceRequestDto>> GetServiceRequestsAsync(SearchFilterDto filter);
        Task<ServiceRequestDto?> GetServiceRequestByIdAsync(int id);
        Task<IEnumerable<ServiceRequestDto>> GetServiceRequestsByMerchantAsync(string merchantId);
        Task<IEnumerable<ServiceRequestDto>> GetOpenServiceRequestsAsync();
        Task<ServiceRequestDto> CreateServiceRequestAsync(string merchantId, CreateServiceRequestDto createServiceRequestDto);
        Task<ServiceRequestDto?> UpdateServiceRequestAsync(int id, string merchantId, CreateServiceRequestDto updateServiceRequestDto);
        Task<bool> DeleteServiceRequestAsync(int id, string merchantId);
        Task<bool> IncrementViewCountAsync(int id);
    }

    public interface IRentalService
    {
        Task<PagedResultDto<RentalDto>> GetRentalsAsync(SearchFilterDto filter);
        Task<RentalDto?> GetRentalByIdAsync(int id);
        Task<IEnumerable<RentalDto>> GetRentalsByCustomerAsync(string customerId);
        Task<IEnumerable<RentalDto>> GetRentalsByMerchantAsync(string merchantId);
        Task<RentalDto> CreateRentalAsync(string customerId, CreateRentalDto createRentalDto);
        Task<bool> ConfirmRentalAsync(int id, string merchantId);
        Task<bool> StartRentalAsync(int id, string merchantId);
        Task<bool> CompleteRentalAsync(int id, string merchantId);
        Task<bool> CancelRentalAsync(int id, string userId, string reason);
        Task<IEnumerable<RentalDto>> GetOverdueRentalsAsync();
        Task<IEnumerable<RentalDto>> GetUpcomingReturnsAsync(int days = 7);
    }

    public interface IAccountingService
    {
        Task<IEnumerable<InvoiceDto>> GetInvoicesByMerchantAsync(string merchantId);
        Task<InvoiceDto?> GetInvoiceByIdAsync(int id);
        Task<InvoiceDto> CreateInvoiceAsync(string merchantId, CreateInvoiceDto createInvoiceDto);
        Task<bool> MarkInvoiceAsPaidAsync(int id, string merchantId);
        Task<decimal> GetTotalSalesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetTotalExpensesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<ExpenseDto>> GetExpensesAsync(string merchantId);
        Task<ExpenseDto> CreateExpenseAsync(string merchantId, CreateExpenseDto createExpenseDto);
        Task<IEnumerable<InventoryItemDto>> GetInventoryItemsAsync(string merchantId);
        Task<IEnumerable<InventoryItemDto>> GetLowStockItemsAsync(string merchantId);
    }

    // Additional DTOs for Accounting
    public class InvoiceDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public InvoiceType Type { get; set; }
        public InvoiceStatus Status { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public List<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
    }

    public class CreateInvoiceDto
    {
        [Required]
        public InvoiceType Type { get; set; }
        public string? CustomerId { get; set; }
        [MaxLength(200)]
        public string? CustomerName { get; set; }
        [Required]
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal TaxRate { get; set; } = 0;
        [MaxLength(1000)]
        public string? Notes { get; set; }
        public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>();
    }

    public class InvoiceItemDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CreateInvoiceItemDto
    {
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Quantity { get; set; }
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }

    public class ExpenseDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public ExpenseCategory Category { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Vendor { get; set; }
        public string? PaymentMethod { get; set; }
    }

    public class CreateExpenseDto
    {
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
        [Required]
        public ExpenseCategory Category { get; set; }
        [Required]
        public DateTime ExpenseDate { get; set; }
        [MaxLength(100)]
        public string? Vendor { get; set; }
        [MaxLength(100)]
        public string? PaymentMethod { get; set; }
    }

    public class InventoryItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? SKU { get; set; }
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; }
        public int ReorderPoint { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; }
    }
}

