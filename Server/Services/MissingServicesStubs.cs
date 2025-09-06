using ConstructionMarketplace.DTOs;
using ConstructionMarketplace.Models;
using ConstructionMarketplace.Repositories;

namespace ConstructionMarketplace.Services
{
    // Minimal stubs to satisfy DI registrations in Program.cs.
    public class ProjectService : IProjectService
    {
        public Task<ProjectDto> CreateProjectAsync(string customerId, CreateProjectDto createProjectDto) => throw new NotImplementedException();
        public Task<bool> DeleteProjectAsync(int id, string customerId) => throw new NotImplementedException();
        public Task<ProjectDto?> GetProjectByIdAsync(int id) => throw new NotImplementedException();
        public Task<PagedResultDto<ProjectDto>> GetProjectsAsync(SearchFilterDto filter) => throw new NotImplementedException();
        public Task<IEnumerable<ProjectDto>> GetProjectsByCustomerAsync(string customerId) => throw new NotImplementedException();
        public Task<IEnumerable<ProjectDto>> GetOpenProjectsAsync() => throw new NotImplementedException();
        public Task<bool> IncrementViewCountAsync(int id) => throw new NotImplementedException();
        public Task<ProjectDto?> UpdateProjectAsync(int id, string customerId, CreateProjectDto updateProjectDto) => throw new NotImplementedException();
        public Task<bool> SelectBidAsync(int projectId, int bidId, string customerId) => throw new NotImplementedException();
    }

    public class BidService : IBidService
    {
        public Task<BidDto> CreateBidAsync(string merchantId, CreateBidDto createBidDto) => throw new NotImplementedException();
        public Task<bool> AcceptBidAsync(int id, string customerId) => throw new NotImplementedException();
        public Task<bool> RejectBidAsync(int id, string customerId, string reason) => throw new NotImplementedException();
        public Task<bool> WithdrawBidAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<BidDto?> GetBidByIdAsync(int id) => throw new NotImplementedException();
        public Task<IEnumerable<BidDto>> GetBidsByMerchantAsync(string merchantId) => throw new NotImplementedException();
        public Task<IEnumerable<BidDto>> GetBidsByProjectAsync(int projectId) => throw new NotImplementedException();
        public Task<BidDto?> UpdateBidAsync(int id, string merchantId, CreateBidDto updateBidDto) => throw new NotImplementedException();
    }

    public class ServiceRequestService : IServiceRequestService
    {
        public Task<ServiceRequestDto> CreateServiceRequestAsync(string merchantId, CreateServiceRequestDto createServiceRequestDto) => throw new NotImplementedException();
        public Task<bool> DeleteServiceRequestAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<ServiceRequestDto?> GetServiceRequestByIdAsync(int id) => throw new NotImplementedException();
        public Task<PagedResultDto<ServiceRequestDto>> GetServiceRequestsAsync(SearchFilterDto filter) => throw new NotImplementedException();
        public Task<IEnumerable<ServiceRequestDto>> GetServiceRequestsByMerchantAsync(string merchantId) => throw new NotImplementedException();
        public Task<IEnumerable<ServiceRequestDto>> GetOpenServiceRequestsAsync() => throw new NotImplementedException();
        public Task<bool> IncrementViewCountAsync(int id) => throw new NotImplementedException();
        public Task<ServiceRequestDto?> UpdateServiceRequestAsync(int id, string merchantId, CreateServiceRequestDto updateServiceRequestDto) => throw new NotImplementedException();
    }

    public class RentalService : IRentalService
    {
        public Task<RentalDto> CreateRentalAsync(string customerId, CreateRentalDto createRentalDto) => throw new NotImplementedException();
        public Task<bool> ConfirmRentalAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<IEnumerable<RentalDto>> GetRentalsByCustomerAsync(string customerId) => throw new NotImplementedException();
        public Task<IEnumerable<RentalDto>> GetRentalsByMerchantAsync(string merchantId) => throw new NotImplementedException();
        public Task<PagedResultDto<RentalDto>> GetRentalsAsync(SearchFilterDto filter) => throw new NotImplementedException();
        public Task<RentalDto?> GetRentalByIdAsync(int id) => throw new NotImplementedException();
        public Task<bool> StartRentalAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<bool> CompleteRentalAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<bool> CancelRentalAsync(int id, string userId, string reason) => throw new NotImplementedException();
        public Task<IEnumerable<RentalDto>> GetOverdueRentalsAsync() => throw new NotImplementedException();
        public Task<IEnumerable<RentalDto>> GetUpcomingReturnsAsync(int days = 7) => throw new NotImplementedException();
    }

    public class AccountingService : IAccountingService
    {
        public Task<InvoiceDto> CreateInvoiceAsync(string merchantId, CreateInvoiceDto createInvoiceDto) => throw new NotImplementedException();
        public Task<bool> MarkInvoiceAsPaidAsync(int id, string merchantId) => throw new NotImplementedException();
        public Task<IEnumerable<ExpenseDto>> GetExpensesAsync(string merchantId) => throw new NotImplementedException();
        public Task<InvoiceDto?> GetInvoiceByIdAsync(int id) => throw new NotImplementedException();
        public Task<IEnumerable<InvoiceDto>> GetInvoicesByMerchantAsync(string merchantId) => throw new NotImplementedException();
        public Task<decimal> GetTotalExpensesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null) => throw new NotImplementedException();
        public Task<IEnumerable<InventoryItemDto>> GetInventoryItemsAsync(string merchantId) => throw new NotImplementedException();
        public Task<decimal> GetTotalSalesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null) => throw new NotImplementedException();
        public Task<ExpenseDto> CreateExpenseAsync(string merchantId, CreateExpenseDto createExpenseDto) => throw new NotImplementedException();
        public Task<IEnumerable<InventoryItemDto>> GetLowStockItemsAsync(string merchantId) => throw new NotImplementedException();
    }
}
