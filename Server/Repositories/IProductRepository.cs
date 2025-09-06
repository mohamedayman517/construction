using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> GetByMerchantAsync(string merchantId);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync();
        Task<IEnumerable<Product>> GetAvailableForRentAsync();
        Task<Product?> GetBySlugAsync(string slug);
        Task<Product?> GetBySKUAsync(string sku);
        Task<IEnumerable<Product>> SearchAsync(string searchTerm, int? categoryId = null);
        Task<IEnumerable<Product>> GetTopRatedAsync(int count = 10);
        Task<IEnumerable<Product>> GetMostViewedAsync(int count = 10);
        Task<bool> UpdateStockAsync(int productId, int newStock);
        Task<bool> IncrementViewCountAsync(int productId);
        Task<bool> UpdateRatingAsync(int productId, decimal newRating, int reviewCount);
    }

    public interface ICategoryRepository : IRepository<Category>
    {
        Task<IEnumerable<Category>> GetRootCategoriesAsync();
        Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentCategoryId);
        Task<Category?> GetWithSubCategoriesAsync(int categoryId);
        Task<IEnumerable<Category>> GetActiveCategoriesAsync();
    }

    public interface IProjectRepository : IRepository<Project>
    {
        Task<IEnumerable<Project>> GetByCustomerAsync(string customerId);
        Task<IEnumerable<Project>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<Project>> GetByStatusAsync(ProjectStatus status);
        Task<IEnumerable<Project>> GetOpenForBiddingAsync();
        Task<IEnumerable<Project>> GetWithinBudgetRangeAsync(decimal minBudget, decimal maxBudget);
        Task<Project?> GetWithBidsAsync(int projectId);
        Task<bool> IncrementViewCountAsync(int projectId);
        Task<bool> IncrementBidCountAsync(int projectId);
    }

    public interface IBidRepository : IRepository<Bid>
    {
        Task<IEnumerable<Bid>> GetByProjectAsync(int projectId);
        Task<IEnumerable<Bid>> GetByMerchantAsync(string merchantId);
        Task<IEnumerable<Bid>> GetByStatusAsync(BidStatus status);
        Task<Bid?> GetLowestBidForProjectAsync(int projectId);
        Task<IEnumerable<Bid>> GetCounterOffersAsync(int originalBidId);
    }

    public interface IServiceRequestRepository : IRepository<ServiceRequest>
    {
        Task<IEnumerable<ServiceRequest>> GetByMerchantAsync(string merchantId);
        Task<IEnumerable<ServiceRequest>> GetByStatusAsync(ServiceRequestStatus status);
        Task<IEnumerable<ServiceRequest>> GetByServiceTypeAsync(ServiceType serviceType);
        Task<IEnumerable<ServiceRequest>> GetOpenRequestsAsync();
        Task<IEnumerable<ServiceRequest>> GetByLocationAsync(string location);
        Task<ServiceRequest?> GetWithApplicationsAsync(int serviceRequestId);
        Task<bool> IncrementViewCountAsync(int serviceRequestId);
        Task<bool> IncrementApplicationCountAsync(int serviceRequestId);
    }

    public interface IRentalRepository : IRepository<Rental>
    {
        Task<IEnumerable<Rental>> GetByCustomerAsync(string customerId);
        Task<IEnumerable<Rental>> GetByMerchantAsync(string merchantId);
        Task<IEnumerable<Rental>> GetByProductAsync(int productId);
        Task<IEnumerable<Rental>> GetByStatusAsync(RentalStatus status);
        Task<IEnumerable<Rental>> GetOverdueRentalsAsync();
        Task<IEnumerable<Rental>> GetUpcomingReturnsAsync(int days = 7);
        Task<Rental?> GetWithPaymentsAsync(int rentalId);
    }

    public interface IAccountingRepository : IRepository<Invoice>
    {
        Task<IEnumerable<Invoice>> GetByMerchantAsync(string merchantId);
        Task<IEnumerable<Invoice>> GetByTypeAsync(InvoiceType type);
        Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status);
        Task<IEnumerable<Invoice>> GetOverdueInvoicesAsync();
        Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber);
        Task<decimal> GetTotalSalesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<decimal> GetTotalExpensesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<Expense>> GetExpensesByCategoryAsync(string merchantId, ExpenseCategory category);
        Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync(string merchantId);
    }
}

