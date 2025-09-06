using Microsoft.EntityFrameworkCore;
using ConstructionMarketplace.Data;
using ConstructionMarketplace.Models;

namespace ConstructionMarketplace.Repositories
{
    public class UserRepository : Repository<ApplicationUser>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ApplicationUser?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<ApplicationUser?> GetByUsernameAsync(string username)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username);
        }

        public async Task<IEnumerable<ApplicationUser>> GetByRoleAsync(string role)
        {
            return await _dbSet
                .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, UserRole = ur })
                .Join(_context.Roles, ur => ur.UserRole.RoleId, r => r.Id, (ur, r) => new { ur.User, Role = r })
                .Where(x => x.Role.Name == role)
                .Select(x => x.User)
                .ToListAsync();
        }

        public async Task<IEnumerable<ApplicationUser>> GetMerchantsAsync()
        {
            return await GetByRoleAsync("Merchant");
        }

        public async Task<IEnumerable<ApplicationUser>> GetWorkersAsync()
        {
            return await GetByRoleAsync("Worker");
        }

        public async Task<IEnumerable<ApplicationUser>> GetCustomersAsync()
        {
            return await GetByRoleAsync("Customer");
        }

        public async Task<IEnumerable<ApplicationUser>> GetVerifiedUsersAsync()
        {
            return await _dbSet.Where(u => u.IsVerified == true).ToListAsync();
        }

        public async Task<IEnumerable<ApplicationUser>> GetUsersWithAccountingSubscriptionAsync()
        {
            return await _dbSet
                .Where(u => u.HasAccountingSubscription == true && 
                           u.SubscriptionEndDate > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task<bool> UpdateRatingAsync(string userId, decimal newRating, int reviewCount)
        {
            var user = await GetByIdAsync(userId);
            if (user != null)
            {
                user.Rating = newRating;
                user.ReviewCount = reviewCount;
                user.UpdatedAt = DateTime.UtcNow;
                return await SaveChangesAsync();
            }
            return false;
        }
    }
}

