using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Data;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Repositories
{
    public class BidRepository : Repository<Bid>, IBidRepository
    {
        public BidRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Bid>> GetByProjectAsync(int projectId)
        {
            return await _dbSet
                .Include(b => b.Merchant)
                .Where(b => b.ProjectId == projectId)
                .OrderBy(b => b.Amount)
                .ToListAsync();
        }

        public async Task<IEnumerable<Bid>> GetByMerchantAsync(string merchantId)
        {
            return await _dbSet
                .Include(b => b.Project)
                    .ThenInclude(p => p.Customer)
                .Where(b => b.MerchantId == merchantId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Bid>> GetByStatusAsync(BidStatus status)
        {
            return await _dbSet
                .Include(b => b.Project)
                .Include(b => b.Merchant)
                .Where(b => b.Status == status)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Bid?> GetLowestBidForProjectAsync(int projectId)
        {
            return await _dbSet
                .Include(b => b.Merchant)
                .Where(b => b.ProjectId == projectId && b.Status == BidStatus.Submitted)
                .OrderBy(b => b.Amount)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Bid>> GetCounterOffersAsync(int originalBidId)
        {
            return await _dbSet
                .Include(b => b.Merchant)
                .Where(b => b.OriginalBidId == originalBidId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }
    }

    public class ServiceRequestRepository : Repository<ServiceRequest>, IServiceRequestRepository
    {
        public ServiceRequestRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<ServiceRequest?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Include(sr => sr.Applications)
                    .ThenInclude(a => a.Worker)
                .FirstOrDefaultAsync(sr => sr.Id == id);
        }

        public async Task<IEnumerable<ServiceRequest>> GetByMerchantAsync(string merchantId)
        {
            return await _dbSet
                .Where(sr => sr.MerchantId == merchantId)
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceRequest>> GetByStatusAsync(ServiceRequestStatus status)
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Where(sr => sr.Status == status)
                .OrderByDescending(sr => sr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceRequest>> GetByServiceTypeAsync(ServiceType serviceType)
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Where(sr => sr.ServiceType == serviceType && sr.Status == ServiceRequestStatus.Open)
                .OrderByDescending(sr => sr.PayRate)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceRequest>> GetOpenRequestsAsync()
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Where(sr => sr.Status == ServiceRequestStatus.Open && sr.ApplicationDeadline > DateTime.UtcNow)
                .OrderBy(sr => sr.ApplicationDeadline)
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceRequest>> GetByLocationAsync(string location)
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Where(sr => sr.Location.Contains(location) && sr.Status == ServiceRequestStatus.Open)
                .OrderByDescending(sr => sr.PayRate)
                .ToListAsync();
        }

        public async Task<ServiceRequest?> GetWithApplicationsAsync(int serviceRequestId)
        {
            return await _dbSet
                .Include(sr => sr.Merchant)
                .Include(sr => sr.Applications)
                    .ThenInclude(a => a.Worker)
                .FirstOrDefaultAsync(sr => sr.Id == serviceRequestId);
        }

        public async Task<bool> IncrementViewCountAsync(int serviceRequestId)
        {
            var serviceRequest = await _dbSet.FindAsync(serviceRequestId);
            if (serviceRequest != null)
            {
                serviceRequest.ViewCount++;
                return await SaveChangesAsync();
            }
            return false;
        }

        public async Task<bool> IncrementApplicationCountAsync(int serviceRequestId)
        {
            var serviceRequest = await _dbSet.FindAsync(serviceRequestId);
            if (serviceRequest != null)
            {
                serviceRequest.ApplicationCount++;
                return await SaveChangesAsync();
            }
            return false;
        }
    }

    public class RentalRepository : Repository<Rental>, IRentalRepository
    {
        public RentalRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Rental?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Include(r => r.Images)
                .Include(r => r.Payments)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Rental>> GetByCustomerAsync(string customerId)
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Merchant)
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetByMerchantAsync(string merchantId)
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Where(r => r.MerchantId == merchantId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetByProductAsync(int productId)
        {
            return await _dbSet
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetByStatusAsync(RentalStatus status)
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Where(r => r.Status == status)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetOverdueRentalsAsync()
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Where(r => r.Status == RentalStatus.InUse && r.EndDate < DateTime.UtcNow)
                .OrderBy(r => r.EndDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetUpcomingReturnsAsync(int days = 7)
        {
            var futureDate = DateTime.UtcNow.AddDays(days);
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Where(r => r.Status == RentalStatus.InUse && 
                           r.EndDate >= DateTime.UtcNow && 
                           r.EndDate <= futureDate)
                .OrderBy(r => r.EndDate)
                .ToListAsync();
        }

        public async Task<Rental?> GetWithPaymentsAsync(int rentalId)
        {
            return await _dbSet
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .Include(r => r.Merchant)
                .Include(r => r.Payments)
                .FirstOrDefaultAsync(r => r.Id == rentalId);
        }
    }

    public class AccountingRepository : Repository<Invoice>, IAccountingRepository
    {
        public AccountingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Invoice?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(i => i.Merchant)
                .Include(i => i.Customer)
                .Include(i => i.Items)
                    .ThenInclude(ii => ii.Product)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<IEnumerable<Invoice>> GetByMerchantAsync(string merchantId)
        {
            return await _dbSet
                .Include(i => i.Customer)
                .Where(i => i.MerchantId == merchantId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetByTypeAsync(InvoiceType type)
        {
            return await _dbSet
                .Include(i => i.Merchant)
                .Include(i => i.Customer)
                .Where(i => i.Type == type)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetByStatusAsync(InvoiceStatus status)
        {
            return await _dbSet
                .Include(i => i.Merchant)
                .Include(i => i.Customer)
                .Where(i => i.Status == status)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetOverdueInvoicesAsync()
        {
            return await _dbSet
                .Include(i => i.Merchant)
                .Include(i => i.Customer)
                .Where(i => i.Status == InvoiceStatus.Sent && 
                           i.DueDate.HasValue && 
                           i.DueDate < DateTime.UtcNow)
                .OrderBy(i => i.DueDate)
                .ToListAsync();
        }

        public async Task<Invoice?> GetByInvoiceNumberAsync(string invoiceNumber)
        {
            return await _dbSet
                .Include(i => i.Merchant)
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
        }

        public async Task<decimal> GetTotalSalesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _dbSet.Where(i => i.MerchantId == merchantId && 
                                         i.Type == InvoiceType.Sale && 
                                         i.Status == InvoiceStatus.Paid);

            if (fromDate.HasValue)
                query = query.Where(i => i.InvoiceDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(i => i.InvoiceDate <= toDate.Value);

            return await query.SumAsync(i => i.TotalAmount);
        }

        public async Task<decimal> GetTotalExpensesAsync(string merchantId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.Expenses.Where(e => e.MerchantId == merchantId);

            if (fromDate.HasValue)
                query = query.Where(e => e.ExpenseDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(e => e.ExpenseDate <= toDate.Value);

            return await query.SumAsync(e => e.Amount);
        }

        public async Task<IEnumerable<Expense>> GetExpensesByCategoryAsync(string merchantId, ExpenseCategory category)
        {
            return await _context.Expenses
                .Where(e => e.MerchantId == merchantId && e.Category == category)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<InventoryItem>> GetLowStockItemsAsync(string merchantId)
        {
            return await _context.InventoryItems
                .Where(i => i.MerchantId == merchantId && 
                           i.IsActive && 
                           i.CurrentStock <= i.ReorderPoint)
                .OrderBy(i => i.CurrentStock)
                .ToListAsync();
        }
    }
}

