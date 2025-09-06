using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Data;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Product?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images)
                .Include(p => p.Attributes)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .OrderBy(p => p.NameEn)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByMerchantAsync(string merchantId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.MerchantId == merchantId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync()
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.IsFeatured && p.IsActive)
                .OrderByDescending(p => p.AverageRating)
                .ThenByDescending(p => p.ViewCount)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetAvailableForRentAsync()
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.IsAvailableForRent && p.IsActive && p.RentPricePerDay.HasValue)
                .OrderBy(p => p.RentPricePerDay)
                .ToListAsync();
        }

        public async Task<Product?> GetBySlugAsync(string slug)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images)
                .Include(p => p.Attributes)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);
        }

        public async Task<Product?> GetBySKUAsync(string sku)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .FirstOrDefaultAsync(p => p.SKU == sku);
        }

        public async Task<IEnumerable<Product>> SearchAsync(string searchTerm, int? categoryId = null)
        {
            var query = _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(p => 
                    p.NameEn.Contains(searchTerm) || 
                    p.NameAr.Contains(searchTerm) ||
                    p.DescriptionEn!.Contains(searchTerm) ||
                    p.DescriptionAr!.Contains(searchTerm) ||
                    p.SKU!.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            return await query
                .OrderByDescending(p => p.AverageRating)
                .ThenByDescending(p => p.ViewCount)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetTopRatedAsync(int count = 10)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.IsActive && p.AverageRating.HasValue)
                .OrderByDescending(p => p.AverageRating)
                .ThenByDescending(p => p.ReviewCount)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetMostViewedAsync(int count = 10)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Merchant)
                .Include(p => p.Images.Where(i => i.IsPrimary))
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.ViewCount)
                .Take(count)
                .ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(int productId, int newStock)
        {
            var product = await GetByIdAsync(productId);
            if (product != null)
            {
                product.StockQuantity = newStock;
                product.UpdatedAt = DateTime.UtcNow;
                return await SaveChangesAsync();
            }
            return false;
        }

        public async Task<bool> IncrementViewCountAsync(int productId)
        {
            var product = await _dbSet.FindAsync(productId);
            if (product != null)
            {
                product.ViewCount++;
                return await SaveChangesAsync();
            }
            return false;
        }

        public async Task<bool> UpdateRatingAsync(int productId, decimal newRating, int reviewCount)
        {
            var product = await GetByIdAsync(productId);
            if (product != null)
            {
                product.AverageRating = newRating;
                product.ReviewCount = reviewCount;
                product.UpdatedAt = DateTime.UtcNow;
                return await SaveChangesAsync();
            }
            return false;
        }
    }

    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        public CategoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Category>> GetRootCategoriesAsync()
        {
            return await _dbSet
                .Where(c => c.ParentCategoryId == null && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.NameEn)
                .ToListAsync();
        }

        public async Task<IEnumerable<Category>> GetSubCategoriesAsync(int parentCategoryId)
        {
            return await _dbSet
                .Where(c => c.ParentCategoryId == parentCategoryId && c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.NameEn)
                .ToListAsync();
        }

        public async Task<Category?> GetWithSubCategoriesAsync(int categoryId)
        {
            return await _dbSet
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .FirstOrDefaultAsync(c => c.Id == categoryId);
        }

        public async Task<IEnumerable<Category>> GetActiveCategoriesAsync()
        {
            return await _dbSet
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.NameEn)
                .ToListAsync();
        }
    }

    public class ProjectRepository : Repository<Project>, IProjectRepository
    {
        public ProjectRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Project?> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Bids)
                    .ThenInclude(b => b.Merchant)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Project>> GetByCustomerAsync(string customerId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Images.Take(1))
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId && p.Status == ProjectStatus.InBidding)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetByStatusAsync(ProjectStatus status)
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Where(p => p.Status == status)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetOpenForBiddingAsync()
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Include(p => p.Images.Take(1))
                .Where(p => p.Status == ProjectStatus.InBidding && p.BiddingDeadline > DateTime.UtcNow)
                .OrderBy(p => p.BiddingDeadline)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetWithinBudgetRangeAsync(decimal minBudget, decimal maxBudget)
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Where(p => p.Status == ProjectStatus.InBidding && 
                           p.BudgetMin >= minBudget && 
                           p.BudgetMax <= maxBudget)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Project?> GetWithBidsAsync(int projectId)
        {
            return await _dbSet
                .Include(p => p.Customer)
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Include(p => p.Bids.Where(b => b.Status == BidStatus.Submitted))
                    .ThenInclude(b => b.Merchant)
                .FirstOrDefaultAsync(p => p.Id == projectId);
        }

        public async Task<bool> IncrementViewCountAsync(int projectId)
        {
            var project = await _dbSet.FindAsync(projectId);
            if (project != null)
            {
                project.ViewCount++;
                return await SaveChangesAsync();
            }
            return false;
        }

        public async Task<bool> IncrementBidCountAsync(int projectId)
        {
            var project = await _dbSet.FindAsync(projectId);
            if (project != null)
            {
                project.BidCount++;
                return await SaveChangesAsync();
            }
            return false;
        }
    }
}

